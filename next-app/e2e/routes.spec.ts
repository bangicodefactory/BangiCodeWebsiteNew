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

/*
 * Paths containing a DOT are the case the test above cannot reach. The i18n
 * middleware's matcher excludes them, so they arrive at [locale] with the
 * filename as the locale, hit notFound(), and render the locale boundary
 * outside any established request locale. While that boundary used next-intl's
 * Link — which resolves the locale by reading headers — every one of these
 * answered 500: mistyped asset URLs, stale links to old .html pages, and the
 * steady background of bots probing for /wp-login.php.
 */
test("@smoke missing paths that look like files 404 rather than 500", async ({
  page,
}) => {
  for (const path of [
    "/nope.txt",
    "/old-page.html",
    "/wp-login.php",
    "/en/missing-asset.png",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should 404`).toBe(404);
  }
});

/*
 * The root boundary must be BRANDED, not merely correct.
 *
 * Fixing the 500 above made this page the visible answer for every stale
 * inbound link — including the twelve legacy /work/<slug> case studies — and it
 * was still the bare monospace placeholder that [locale]/not-found.tsx was
 * written to stop the site serving. It is a separate root layout, so it owns
 * its own stylesheet; asserting a computed style is the only way to catch that
 * regressing, since the markup renders fine with no CSS attached at all.
 */
test("@smoke the root 404 is styled, not a bare fallback", async ({ page }) => {
  const response = await page.goto("/nope.txt");
  expect(response?.status()).toBe(404);

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  const font = await heading.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font, "root 404 should use the display face").toContain(
    "Chakra Petch",
  );

  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  // Tailwind's default is transparent/white; the token surface is ink-50.
  expect(bg).toBe("rgb(246, 248, 251)");

  /*
   * A 404 must not claim a canonical URL of its own — asserted against the
   * SERVED HTML, not the live DOM. Next re-injects a canonical during
   * hydration, so a DOM query finds one no matter what the server sent. The
   * response body is what a crawler receives and what the fix actually
   * changed; the page is noindex in either case.
   */
  const html = (await response?.text()) ?? "";
  expect(html).not.toContain('rel="canonical"');
  expect(html).toContain('name="robots" content="noindex"');
});

test("@smoke primary nav is the Design D IA", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation", { name: /main navigation/i });
  for (const href of [
    /*
     * Home is an explicit item, not only the logo. Someone deep in a case
     * study had no visible way back to the landing page — the logo does link
     * home, but that is a convention you have to already know rather than see.
     */
    "/en",
    "/en/services",
    "/en/solutions",
    "/en/portfolio",
    "/en/about",
    // Labelled "Case studies"; the route stays /blog so published URLs, the
    // sitemap and the CMS all keep working.
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
