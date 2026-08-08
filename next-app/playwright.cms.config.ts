import { defineConfig, devices } from "@playwright/test";

/**
 * CMS end-to-end tests — a SECOND Playwright config, deliberately.
 *
 * The default config runs the site with the CMS unconfigured, which is what CI
 * and a fresh checkout look like, and `e2e/admin-auth.spec.ts` asserts exactly
 * that (every admin path denied, setup instructions shown). Configuring the
 * server in that run would invert the meaning of those tests.
 *
 * So this config starts the app pointed at a TEST DATABASE. There is no stub:
 * the GitHub stub it replaced was a fake of that API's shape, and faking a
 * database badly is a much easier mistake to make than running a real one —
 * transactions, unique constraints and cascading deletes are precisely what
 * these tests are checking, and only the real engine has them.
 *
 * DB_NAME must be a test database. `support.ts` truncates it between tests.
 *
 * Run with: pnpm test:cms
 */
const DB = {
  DB_HOST: process.env.DB_HOST ?? "127.0.0.1",
  DB_PORT: process.env.DB_PORT ?? "3306",
  DB_USER: process.env.DB_USER ?? "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.CMS_TEST_DB ?? "bangicode_test",
};

export default defineConfig({
  testDir: "./e2e/cms",
  fullyParallel: false, // one shared database — parallel writes would interleave
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: [
    {
      command: "pnpm start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        ...DB,
        SITE_URL: "http://localhost:3000",
        // Test-only. Long enough to derive a key; a credential for nothing.
        ADMIN_SESSION_SECRET:
          "playwright-cms-suite-secret-at-least-32-characters-long",
      },
    },
  ],
});

/** Exported so support.ts connects to exactly the database the app is using. */
export const TEST_DB = DB;
