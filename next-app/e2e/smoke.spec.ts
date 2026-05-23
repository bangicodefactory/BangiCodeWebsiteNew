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

test("@smoke WhatsApp CTA — visible on each locale", async ({ page }) => {
  for (const locale of ["en", "fr", "ar"]) {
    await page.goto(`/${locale}`);
    await expect(page.getByRole("link", { name: /whatsapp/i })).toBeVisible();
  }
});
