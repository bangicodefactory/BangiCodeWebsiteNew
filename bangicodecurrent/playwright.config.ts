import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /*
   * e2e/cms needs a CONFIGURED server plus a stub GitHub, and this run
   * deliberately starts an UNconfigured one (which is what a fresh checkout and
   * CI look like — admin-auth.spec.ts asserts that state). Those specs live in
   * playwright.cms.config.ts instead: `pnpm test:cms`.
   */
  testIgnore: "**/cms/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
