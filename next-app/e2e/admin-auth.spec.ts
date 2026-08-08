import { test, expect } from "@playwright/test";

/*
 * Auth gating for the CMS. See ADR 0003.
 *
 * These run against a server started WITHOUT database credentials, which is
 * the CI default and also the "someone deployed without finishing setup" case.
 * The important properties hold either way:
 *
 *   - /admin is never reachable without a valid session
 *   - an unconfigured server explains itself instead of crashing or looping
 *   - a forged or tampered session cookie is rejected, not merely "present"
 *
 * The happy path — a real password sign-in — needs a database, so it lives in
 * `admin-lockout.spec.ts`, which skips itself when there is none. The
 * primitives underneath are covered by `admin-password.spec.ts`.
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
  // Either it is configured (a credential form) or it names the missing vars.
  const configured = await page.locator('input[name="password"]').count();
  if (!configured) {
    expect(body).toContain("Server setup incomplete");
    /*
     * ADMIN_SESSION_SECRET specifically, and not DB_HOST.
     *
     * CI now runs this job with a database available, so DB_HOST is set and
     * correctly absent from the missing list — asserting on it would have gone
     * red on the runner while passing on a bare local checkout. The secret is
     * the one this run always withholds, and naming the exact variable is the
     * difference between a five-minute fix and an afternoon.
     */
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

test("@smoke signing in is POST-only", async ({ request }) => {
  // Credentials must never ride in a URL: a GET form would put the password in
  // the address bar, browser history, and every proxy log on the way.
  const res = await request.get("/admin/auth/login", {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  expect(res.status()).toBe(405);
});

test("@smoke bad credentials never mint a session", async ({ request }) => {
  const res = await request.post("/admin/auth/login", {
    form: { email: "nobody@bangicode.test", password: "wrong-password" },
    maxRedirects: 0,
    failOnStatusCode: false,
  });

  expect([302, 303, 307, 308]).toContain(res.status());
  const location = res.headers()["location"] ?? "";
  expect(location).toContain("/admin/login");
  // Coarse on purpose: "invalid_credentials" says nothing about WHICH half was
  // wrong, so the form cannot be used to discover which addresses exist.
  expect(location).toMatch(/error=(invalid_credentials|not_configured)/);

  // And, whatever happened, no session cookie came back.
  const setCookie = res.headers()["set-cookie"] ?? "";
  expect(setCookie).not.toMatch(/bangicode_admin=[^;\s]/);
});

/*
 * Redirects must name the host the visitor asked for.
 *
 * Behind Phusion Passenger, `request.url` inside a Route Handler is the address
 * the Node process is BOUND to, not the one the browser used. Sign-in on
 * staging redirected to `https://0.0.0.0:3000/admin` — a browser follows that
 * straight off the internet and sign-in looks completely broken.
 *
 * curl hid it: it follows the Location header regardless, so the flow "passed"
 * end to end while being unusable. This asserts on the header itself, which is
 * the only thing that would have caught it.
 *
 * Middleware never had the bug — there `request.url` IS the external URL — so
 * the /admin bounce was correct while the login POST was not. Same API, two
 * different notions of "the request".
 */
test("@smoke auth redirects point at the requested host, not the bind address", async ({
  request,
  baseURL,
}) => {
  const expectedHost = new URL(baseURL ?? "http://localhost:3000").host;

  const res = await request.post("/admin/auth/login", {
    form: { email: "nobody@bangicode.test", password: "wrong-password" },
    maxRedirects: 0,
    failOnStatusCode: false,
  });

  const location = res.headers()["location"] ?? "";
  expect(location, "a redirect must be issued").toBeTruthy();

  // Relative Locations are fine — the browser resolves them against the
  // request. An ABSOLUTE one pointing anywhere else is the bug.
  if (/^https?:\/\//.test(location)) {
    expect(new URL(location).host, `Location was ${location}`).toBe(
      expectedHost,
    );
    expect(location).not.toContain("0.0.0.0");
  }

  const logout = await request.post("/admin/auth/logout", {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  const logoutLocation = logout.headers()["location"] ?? "";
  if (/^https?:\/\//.test(logoutLocation)) {
    expect(new URL(logoutLocation).host).toBe(expectedHost);
  }
});
