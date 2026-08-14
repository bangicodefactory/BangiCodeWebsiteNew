import { test, expect } from "@playwright/test";

// @smoke — tagged so CI can run: playwright test --grep @smoke

test("@smoke / redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en/);
});

test("@smoke /en — loads with lang=en ltr", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/Bangicode/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("@smoke /fr — loads with lang=fr ltr", async ({ page }) => {
  await page.goto("/fr");
  await expect(page).toHaveTitle(/Bangicode/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("@smoke /ar — loads with lang=ar rtl", async ({ page }) => {
  await page.goto("/ar");
  await expect(page).toHaveTitle(/Bangicode/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("@smoke locale switcher — renders three locale buttons", async ({
  page,
}) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation", { name: /language/i });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("button")).toHaveCount(3);
});

test("@smoke /book — renders booking page with correct title", async ({
  page,
}) => {
  await page.goto("/en/book");
  await expect(page).toHaveTitle(/Book a 30-min/);
});

/*
 * Guards the bug that left booking silently dead from the day it shipped.
 *
 * CAL_EVENT_SLUG defaulted to "bangicode/30min-discovery" — an event that has
 * never existed, because the Cal.com account was never created. The 404 happens
 * INSIDE the cross-origin iframe, where CalErrorBoundary cannot see it, so the
 * fallback never fired and every visitor got Cal.com's own error page framed
 * inside ours. The only existing test asserted the page TITLE, which was
 * correct the whole time.
 *
 * Holds in both states: unconfigured means no embed request at all and the
 * fallback carries the page; configured means the embed must actually resolve.
 * So this also catches the slug being pointed at a deleted event later.
 */
test("@smoke /book — never embeds a Cal.com event that 404s", async ({
  page,
}) => {
  const embeds: { url: string; status: number }[] = [];
  page.on("response", (r) => {
    if (r.url().includes("cal.com") && r.url().includes("/embed")) {
      embeds.push({ url: r.url(), status: r.status() });
    }
  });

  await page.goto("/en/book", { waitUntil: "networkidle" });

  const fallback = page.getByText(/Booking widget unavailable/i);

  /*
   * Only 4xx fails. A wrong or deleted slug answers 404 every single time and
   * is a real defect; 5xx and timeouts are Cal.com having a bad minute and say
   * nothing about this repo. An earlier version asserted the iframe was VISIBLE,
   * which made a green suite depend on a third party painting fast enough — it
   * flaked on the very first configured run.
   */
  for (const e of embeds) {
    expect(
      e.status >= 400 && e.status < 500,
      `Cal.com rejected the configured event (HTTP ${e.status}) — the slug is probably wrong or the event was deleted: ${e.url}`,
    ).toBe(false);
  }

  // No embed request at all means unconfigured — the fallback must carry it,
  // rather than the page rendering an empty frame.
  if (embeds.length === 0) {
    await expect(fallback).toBeVisible();
    await expect(
      page.getByRole("link", { name: /hello@bangicode\.ma/ }),
    ).toBeVisible();

    // And the page must be genuinely inert: the preconnect hints were once
    // unconditional, so an unconfigured /book still opened a TCP + TLS
    // connection to cal.com that nothing used.
    await expect(
      page.locator('link[rel="preconnect"][href*="cal.com"]'),
    ).toHaveCount(0);
  }
});

/*
 * The CTA used to hide while scrolling DOWN and return on the way up. Nothing
 * caught that as surprising because the only coverage loaded the page and
 * asserted the button was visible — which it is, at scroll position 0. It was
 * reported as a bug from the live site.
 *
 * Deep in the page is exactly where someone decides to make contact, so this
 * asserts it survives the scroll rather than merely existing on arrival.
 * Opacity, not just visibility: the hidden state was `opacity-0` plus
 * `translate-y-20`, and an opacity-0 element still passes toBeVisible().
 */
test("@smoke WhatsApp CTA — stays visible when scrolled to the bottom", async ({
  page,
}) => {
  await page.goto("/en");
  const cta = page.getByTestId("whatsapp-cta");
  await expect(cta).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // Settle the scroll handler and any transition it may have started.
  await page.waitForTimeout(600);

  await expect(cta).toBeVisible();
  await expect(cta).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(() => window.scrollY),
    "the page must actually have scrolled for this test to mean anything",
  ).toBeGreaterThan(200);
});

test("@smoke WhatsApp CTA — visible on each locale", async ({ page }) => {
  for (const locale of ["en", "fr", "ar"]) {
    await page.goto(`/${locale}`);
    await expect(page.getByTestId("whatsapp-cta")).toBeVisible();
  }
});
