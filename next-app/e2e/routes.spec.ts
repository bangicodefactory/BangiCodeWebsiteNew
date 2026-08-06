import { test, expect } from "@playwright/test";

/*
 * Route coverage for the Design D IA (ADR 0001).
 *
 * Two of these guard bugs that actually shipped:
 *
 *  - The case-study pages returned 500 in production builds. The route was
 *    marked ● (SSG) while the layout resolved the locale from request headers,
 *    so Next threw DYNAMIC_SERVER_USAGE on every prerendered path. Nothing
 *    caught it because no test had ever loaded a /work/<slug> URL. The
 *    "renders, does not 500" assertions below exist so that cannot recur.
 *
 *  - /work → /portfolio must stay a redirect, not a 404. Twelve case-study URLs
 *    are live under the old path.
 */

const LOCALES = ["en", "fr", "ar"] as const;

test("@smoke /work → /portfolio — index redirects in every locale", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    const response = await page.goto(`/${locale}/work`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/portfolio$`));
    expect(response?.status()).toBe(200);
  }
});

test("@smoke /work/:slug → /portfolio/:slug — deep links survive", async ({
  page,
}) => {
  const response = await page.goto("/en/work/rentcar");
  await expect(page).toHaveURL(/\/en\/portfolio\/rentcar$/);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("@smoke case study renders — the page that used to 500", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    const response = await page.goto(`/${locale}/portfolio/rentcar`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("@smoke /solutions — index lists all four platforms", async ({ page }) => {
  const response = await page.goto("/en/solutions");
  expect(response?.status()).toBe(200);
  for (const name of ["RentFlow", "TableServe", "Scholaris", "ShopCore"]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
});

test("@smoke /solutions/:slug — renders and is marked illustrative", async ({
  page,
}) => {
  const response = await page.goto("/en/solutions/rentflow");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("RentFlow");
  // Decision 4: these are patterns, not products. The marker must survive.
  await expect(
    page.locator('[data-placeholder="true"]').first(),
  ).toBeAttached();
});

test("@smoke /blog — renders in every locale", async ({ page }) => {
  for (const locale of LOCALES) {
    const response = await page.goto(`/${locale}/blog`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("@smoke unknown slugs 404 rather than 500", async ({ page }) => {
  for (const path of [
    "/en/portfolio/not-a-project",
    "/en/solutions/not-a-platform",
    "/en/blog/not-a-post",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should 404`).toBe(404);
  }
});

test("@smoke primary nav is the Design D IA", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation", { name: /main navigation/i });
  for (const href of [
    "/en/services",
    "/en/solutions",
    "/en/portfolio",
    "/en/about",
    "/en/blog",
    "/en/contact",
  ]) {
    // .first() because /contact legitimately appears twice in the bar: once as
    // a nav item and once as the "Start a project" spark CTA.
    await expect(nav.locator(`a[href="${href}"]`).first()).toBeVisible();
  }
  // Process and Careers moved to the footer.
  await expect(nav.locator('a[href="/en/process"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/en/careers"]')).toHaveCount(0);
});

test("@smoke sitemap covers the new IA and drops /work", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/en/portfolio");
  expect(xml).toContain("/en/solutions");
  expect(xml).toContain("/en/solutions/rentflow");
  expect(xml).toContain("/en/blog");
  expect(xml).not.toContain("/en/work");
});

/*
 * The www → apex redirect is derived from SITE_URL at build time
 * (next.config.ts, canonicalHostRedirects). It self-disables on localhost, so
 * this asserts the DERIVATION rather than the runtime behaviour — a test
 * against a localhost server can never see the production rule fire.
 *
 * Guards the two ways it silently breaks: someone hardcodes a host, or someone
 * drops the localhost escape hatch and every test starts 308ing.
 */
test("@smoke canonical-host redirect is derived, and off on localhost", async ({
  page,
}) => {
  // If the localhost guard regressed, every request here would redirect away.
  const response = await page.goto("/en");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/localhost:3000\/en$/);

  // And the canonical tag tracks SITE_URL rather than a hardcoded domain.
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonical).toContain("/en");
  expect(canonical).not.toContain("www.");
});
