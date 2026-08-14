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
      page.getByRole("link", { name: /contact@bangicode\.ma/ }),
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
 * Mid-page is exactly where someone decides to make contact, so this asserts it
 * survives the scroll rather than merely existing on arrival.
 *
 * Opacity, not just visibility: the hidden state is `opacity-0` plus
 * `translate-y-20`, and an opacity-0 element STILL PASSES toBeVisible(). Proved
 * by reinstating the old behaviour — toBeVisible() passed, the opacity check
 * failed with "Expected: 1, Received: 0". Asserting visibility alone would ship
 * green against the bug it exists to catch.
 *
 * The explicit wait is load-bearing, not cosmetic: toHaveCSS auto-retries, so
 * without it the assertion passes instantly at opacity 1 — before a
 * scroll-driven hide could ever run — and the guard silently becomes a no-op.
 */
test("@smoke WhatsApp CTA — survives scrolling down the page", async ({
  page,
}) => {
  await page.goto("/en");
  const cta = page.getByTestId("whatsapp-cta");
  await expect(cta).toBeVisible();

  // Mid-page: past the fold, but short of the footer, which the button yields
  // to on purpose (see the obscuring test below).
  await page.evaluate(() =>
    window.scrollTo(0, Math.round(document.body.scrollHeight / 2)),
  );
  await page.waitForTimeout(600);

  await expect(cta).toBeVisible();
  await expect(cta).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(() => window.scrollY),
    "the page must actually have scrolled for this test to mean anything",
  ).toBeGreaterThan(200);
});

/*
 * Making the button always-visible made it cover the footer's "Cookies" link by
 * 77% on desktop — elementFromPoint at the link's own centre returned the
 * BUTTON, so the link could not be clicked and keyboard focus landed underneath
 * it (WCAG 2.2 SC 2.4.11). The scroll-direction hiding had masked it: the
 * button was always gone by the time you reached the footer.
 *
 * Asserting on the Cookies link specifically would guard one symptom. This asks
 * the real question — is the button covering ANY interactive element — so it
 * still holds when the footer is rearranged or the button moves.
 */
test("@smoke WhatsApp CTA — never covers an interactive element", async ({
  page,
}) => {
  for (const path of ["/en", "/en/contact", "/en/portfolio/rentcar"]) {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    const blocked = await page.evaluate(() => {
      const sel = '[data-testid="whatsapp-cta"]';
      const cta = document.querySelector(sel);
      if (!cta) return ["the CTA is not on the page at all"];
      const hits: string[] = [];
      for (const el of document.querySelectorAll(
        "a, button, input, textarea, select",
      )) {
        if (el.closest(sel)) continue;
        const b = el.getBoundingClientRect();
        // On screen and actually rendered.
        if (!b.width || !b.height) continue;
        if (b.bottom < 0 || b.top > window.innerHeight) continue;
        const top = document.elementFromPoint(
          b.x + b.width / 2,
          b.y + b.height / 2,
        );
        if (top?.closest(sel))
          hits.push(
            `<${el.tagName.toLowerCase()}> "${(el.textContent || "").trim().slice(0, 40)}"`,
          );
      }
      return hits;
    });

    expect(
      blocked,
      `the WhatsApp CTA is covering interactive elements on ${path}`,
    ).toEqual([]);
  }
});

test("@smoke WhatsApp CTA — visible on each locale", async ({ page }) => {
  for (const locale of ["en", "fr", "ar"]) {
    await page.goto(`/${locale}`);
    await expect(page.getByTestId("whatsapp-cta")).toBeVisible();
  }
});
