import { defineConfig, devices } from "@playwright/test";

/**
 * CMS end-to-end tests — a SECOND Playwright config, deliberately.
 *
 * The default config runs the site with the CMS unconfigured, which is what CI
 * and a fresh checkout look like, and `e2e/admin-auth.spec.ts` asserts exactly
 * that (every admin path denied, setup instructions shown). Configuring the
 * server in that run would invert the meaning of those tests.
 *
 * So this config brings up two servers instead: a stub GitHub, and the app
 * pointed at it. Nothing here touches api.github.com or a real repository.
 *
 * Run with: pnpm test:cms
 */
const STUB_PORT = 4599;
const COMMIT_LOG = "e2e/support/.stub-commits.json";

export default defineConfig({
  testDir: "./e2e/cms",
  fullyParallel: false, // one shared stub repo — parallel writes would interleave
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
      command: `node e2e/support/stub-github.mjs`,
      url: `http://localhost:${STUB_PORT}/user`,
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
      env: {
        STUB_GITHUB_PORT: String(STUB_PORT),
        STUB_COMMIT_LOG: COMMIT_LOG,
      },
    },
    {
      command: "pnpm start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        SITE_URL: "http://localhost:3000",
        GITHUB_API_URL: `http://localhost:${STUB_PORT}`,
        // Test-only values. The session secret only needs to be long enough to
        // derive a key; nothing here is a credential for anything real.
        ADMIN_SESSION_SECRET:
          "playwright-cms-suite-secret-at-least-32-characters-long",
        GITHUB_CLIENT_ID: "Iv1.test",
        GITHUB_CLIENT_SECRET: "test-secret",
        GITHUB_REPO: "bangicodefactory/test-repo",
        GITHUB_BRANCH: "main",
      },
    },
  ],
});
