import { test, expect } from "@playwright/test";

/*
 * Auth gating for the CMS.
 *
 * These run against a server started WITHOUT GitHub credentials, which is the
 * CI default and also the "someone deployed without finishing setup" case. The
 * important properties hold either way:
 *
 *   - /admin is never reachable without a valid session
 *   - an unconfigured server explains itself instead of crashing or looping
 *   - a forged or tampered session cookie is rejected, not merely "present"
 *
 * The happy path (real GitHub sign-in) cannot be exercised here without live
 * OAuth credentials and a browser session on github.com; it is covered by the
 * unit-level checks in admin-crypto.spec.ts plus manual verification.
 */

const PROTECTED = ["/admin", "/admin/blog", "/admin/portfolio"];

test("@smoke /admin requires a session", async ({ page }) => {
  for (const path of PROTECTED) {
    await page.goto(path);
    await expect(page, `${path} should bounce to login`).toHaveURL(
      /\/admin\/login/,
    );
  }
});

test("@smoke /admin/login renders and never redirect-loops", async ({
  page,
}) => {
  const response = await page.goto("/admin/login");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("@smoke an unconfigured server states what is missing", async ({
  page,
}) => {
  await page.goto("/admin/login");
  const body = await page.locator("body").innerText();
  // Either it is configured (a sign-in button) or it names the missing vars.
  const configured = body.includes("Continue with GitHub");
  if (!configured) {
    expect(body).toContain("Server setup incomplete");
    expect(body).toContain("GITHUB_CLIENT_ID");
    expect(body).toContain("ADMIN_SESSION_SECRET");
  }
});

test("@smoke a forged session cookie does not grant access", async ({
  page,
  context,
}) => {
  // Not sealed with the server's secret — decryption must fail.
  await context.addCookies([
    {
      name: "bangicode_admin",
      value: "ZmFrZS1zZXNzaW9uLXZhbHVl",
      domain: "localhost",
      path: "/admin",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("@smoke admin is excluded from locale routing", async ({ page }) => {
  // The intl middleware must not rewrite /admin to /en/admin.
  await page.goto("/admin/login");
  await expect(page).not.toHaveURL(/\/(en|fr|ar)\/admin/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("@smoke admin is disallowed in robots.txt", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("/admin");
});

test("@smoke sign-out is POST-only", async ({ request }) => {
  // A GET logout would let any <img src> on a visited page sign the admin out.
  const res = await request.get("/admin/auth/logout", {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  expect(res.status()).toBe(405);
});

test("@smoke starting sign-in is POST-only", async ({ request }) => {
  // GET would let a prefetch or crawler mint and burn the OAuth state cookie.
  const res = await request.get("/admin/auth/login", {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  expect(res.status()).toBe(405);
});

test("@smoke the OAuth callback refuses a code with no matching state", async ({
  request,
}) => {
  const res = await request.get(
    "/admin/auth/callback?code=abc123&state=forged",
    {
      maxRedirects: 0,
      failOnStatusCode: false,
    },
  );
  expect([302, 303, 307, 308]).toContain(res.status());
  const location = res.headers()["location"] ?? "";
  expect(location).toContain("/admin/login");
  // Coarse reason, and definitely not a session.
  expect(location).toMatch(/error=(invalid_state|not_configured)/);
  expect(res.headers()["set-cookie"] ?? "").not.toContain("bangicode_admin=ey");
});
