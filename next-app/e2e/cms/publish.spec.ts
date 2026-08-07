import { test, expect, getRevisions, rows } from "./support";

/*
 * The CMS's publishing contract, asserted against what actually reaches
 * storage — not just against what the UI says happened.
 *
 * The properties here are the ones that are invisible from the screen and only
 * show up in production: a post half-published across locales, a write that
 * partly applied, an edit that overwrites the translations it was not touching.
 *
 * Asserted against the DATABASE, not the UI. A banner reading "Post created" is
 * the claim; the rows are whether it happened.
 */

const SLUG = "scoping-fixed-price-work";

/*
 * Scoped to <main>. A bare getByRole("alert") also matches Next's
 * <next-route-announcer>, an always-present empty live region in a shadow root
 * — so an unscoped locator is ambiguous even when the page has one real alert.
 */
const banner = (page: import("@playwright/test").Page) =>
  page.getByRole("main").getByRole("alert");
const okBanner = (page: import("@playwright/test").Page) =>
  page.getByRole("main").getByRole("status");

async function fillLocale(
  page: import("@playwright/test").Page,
  locale: "en" | "fr" | "ar",
  tab: string,
  values: { title: string; description: string; body: string },
) {
  await page.getByRole("tab", { name: new RegExp(tab, "i") }).click();
  await page.fill(`input[name="title.${locale}"]`, values.title);
  await page.fill(`input[name="description.${locale}"]`, values.description);
  await page.fill(`textarea[name="body.${locale}"]`, values.body);
}

test("an incomplete post is refused and writes nothing", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/new");
  await page.fill('input[name="slug"]', SLUG);
  await fillLocale(page, "en", "English", {
    title: "How we scope fixed-price work",
    description: "Why we quote before we build.",
    body: "## Short version\n\nWe scope first.",
  });
  await page.getByRole("button", { name: "Create post" }).click();

  await expect(banner(page)).toContainText("Every locale must be complete");
  // The important half: nothing reached the database. Not a partial post, not
  // an English-only one — nothing.
  expect(
    await rows("SELECT slug FROM posts WHERE slug = ?", [SLUG]),
  ).toHaveLength(0);
  expect(await getRevisions()).toHaveLength(0);
});

test("a rejected submit does not discard the author's work", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/new");
  await page.fill('input[name="slug"]', SLUG);
  await fillLocale(page, "en", "English", {
    title: "How we scope fixed-price work",
    description: "Why we quote before we build.",
    body: "## Short version\n\nWe scope first.",
  });
  await page.getByRole("button", { name: "Create post" }).click();
  await expect(banner(page)).toBeVisible();

  /*
   * React 19 resets a <form action> once the action resolves, so uncontrolled
   * inputs would be blank here — losing a post someone may have spent an hour
   * writing in three languages. This is the regression guard for that.
   */
  await expect(page.locator('input[name="slug"]')).toHaveValue(SLUG);
  await expect(page.locator('input[name="title.en"]')).toHaveValue(
    "How we scope fixed-price work",
  );
  await expect(page.locator('textarea[name="body.en"]')).not.toHaveValue("");
});

test("a field's error clears as soon as it is fixed", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/new");
  await page.fill('input[name="slug"]', SLUG);
  await fillLocale(page, "en", "English", {
    title: "T",
    description: "D",
    body: "B",
  });
  await page.getByRole("button", { name: "Create post" }).click();
  await expect(banner(page)).toBeVisible();

  await page.getByRole("tab", { name: /العربية/ }).click();
  const arabicPanel = page.locator('[role="tabpanel"]:not([hidden])');
  await expect(arabicPanel.getByText("Title is required")).toBeVisible();

  await page.fill('input[name="title.ar"]', "عنوان");
  // Otherwise the editor cannot tell what is still outstanding.
  await expect(arabicPanel.getByText("Title is required")).toHaveCount(0);
});

test("publishing writes every locale in ONE transaction", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/new");
  await page.fill('input[name="slug"]', SLUG);
  await fillLocale(page, "en", "English", {
    title: "How we scope fixed-price work",
    description: "Why we quote before we build.",
    body: "## Short version\n\nWe scope first.",
  });
  await fillLocale(page, "fr", "Français", {
    title: "Comment nous cadrons au forfait",
    description: "Pourquoi nous chiffrons avant de construire.",
    body: "## En bref\n\nNous cadrons d'abord.",
  });
  await fillLocale(page, "ar", "العربية", {
    title: "كيف نحدد نطاق العمل بسعر ثابت",
    description: "لماذا نسعّر قبل أن نبني.",
    body: "## باختصار\n\nنحدد النطاق أولاً.",
  });
  await page.getByRole("button", { name: "Create post" }).click();
  await expect(okBanner(page)).toContainText("Post created");

  const translations = await rows<{
    locale: string;
    title: string;
    body: string;
  }>(
    `SELECT t.locale, t.title, t.body
       FROM posts p JOIN post_translations t ON t.post_id = p.id
      WHERE p.slug = ? ORDER BY t.locale`,
    [SLUG],
  );
  expect(translations.map((t) => t.locale)).toEqual(["ar", "en", "fr"]);

  // Arabic survived the round trip intact — utf8mb4 all the way down.
  const arabic = translations.find((t) => t.locale === "ar");
  expect(arabic?.title).toContain("نطاق");
  expect(arabic?.body).toContain("نحدد النطاق");

  /*
   * Exactly ONE revision, attributed to the person. Three would mean the write
   * happened per locale, which is the partial-publish failure this whole
   * design exists to prevent.
   */
  const revisions = await getRevisions();
  expect(revisions).toHaveLength(1);
  expect(revisions[0]?.entity_slug).toBe(SLUG);
  expect(revisions[0]?.action).toBe("create");
  expect(revisions[0]?.author_name).toBe("Ahmed Chioua");
  expect(revisions[0]?.snapshot).toContain("نحدد النطاق");
});

test("a duplicate slug is refused rather than overwriting", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/new");
  // seeded-post already exists in all three locales.
  await page.fill('input[name="slug"]', "seeded-post");
  await fillLocale(page, "en", "English", {
    title: "Clash",
    description: "Clash",
    body: "Clash",
  });
  await fillLocale(page, "fr", "Français", {
    title: "Clash",
    description: "Clash",
    body: "Clash",
  });
  await fillLocale(page, "ar", "العربية", {
    title: "تعارض",
    description: "تعارض",
    body: "تعارض",
  });
  await page.getByRole("button", { name: "Create post" }).click();

  await expect(banner(page)).toContainText("already exists");

  // The seeded post is untouched — still its own title, not "Clash".
  const seeded = await rows<{ title: string }>(
    `SELECT t.title FROM posts p JOIN post_translations t ON t.post_id = p.id
      WHERE p.slug = ? AND t.locale = 'en'`,
    ["seeded-post"],
  );
  expect(seeded[0]?.title).toBe("Seeded (en)");
  expect(await getRevisions()).toHaveLength(0);
});

test("editing a project leaves the locales it did not touch intact", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/portfolio/rentcar");
  await page.fill('input[name="name.en"]', "RentCar.ma");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(okBanner(page)).toContainText("Project updated");

  const translations = await rows<{
    locale: string;
    name: string;
    summary: string;
  }>(
    `SELECT t.locale, t.name, t.summary
       FROM projects p JOIN project_translations t ON t.project_id = p.id
      WHERE p.slug = ? ORDER BY t.locale`,
    ["rentcar"],
  );
  expect(translations).toHaveLength(3);

  const byLocale = Object.fromEntries(translations.map((t) => [t.locale, t]));
  expect(byLocale.en?.name).toBe("RentCar.ma");
  // The French and Arabic rows were never on screen — an edit that touched
  // only English must not disturb them.
  expect(byLocale.fr?.summary).toBe("FR résumé.");
  expect(byLocale.ar?.summary).toBe("ملخص.");

  const revisions = await getRevisions();
  expect(revisions).toHaveLength(1);
  expect(revisions[0]?.action).toBe("update");
});

test("deleting requires typing the slug, then removes every locale at once", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/blog/seeded-post");
  await page.getByRole("button", { name: "Delete post" }).click();

  const confirmButton = page.getByRole("button", {
    name: "Delete permanently",
  });
  await expect(confirmButton).toBeDisabled();

  await page.fill('input[name="confirm"]', "wrong-slug");
  await expect(confirmButton).toBeDisabled();

  await page.fill('input[name="confirm"]', "seeded-post");
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  await expect(page).toHaveURL(/\/admin\/blog\?deleted=seeded-post/);

  // The post AND all three translations are gone — the latter by ON DELETE
  // CASCADE, the database enforcing what three file deletes used to.
  expect(
    await rows("SELECT slug FROM posts WHERE slug = ?", ["seeded-post"]),
  ).toHaveLength(0);
  expect(await rows("SELECT id FROM post_translations")).toHaveLength(0);

  // The snapshot outlives the thing it describes. That is the entire point of
  // keeping revisions once git history is no longer doing the job.
  const revisions = await getRevisions();
  expect(revisions).toHaveLength(1);
  expect(revisions[0]?.action).toBe("delete");
  expect(revisions[0]?.snapshot).toContain("Seeded (en)");
});

test("listing content writes nothing", async ({ signedIn: page }) => {
  await page.goto("/admin/blog");
  await expect(page.getByText("seeded-post")).toBeVisible();
  await page.goto("/admin/portfolio");
  // By href, not by text: "rentcar" appears in both the row's slug line and
  // its name, so a text locator is ambiguous.
  await expect(
    page.locator('a[href="/admin/portfolio/rentcar"]'),
  ).toBeVisible();

  // A read that writes is how an audit trail fills with noise, and how simply
  // opening a page ends up bumping a timestamp nobody expected to change.
  expect(await getRevisions()).toHaveLength(0);
});

/*
 * The two cross-row rules Zod cannot enforce, because neither is a property of
 * a single project. Both were unguarded on the portfolio path while the blog
 * path had the slug check — the asymmetry was invisible because the only
 * duplicate-slug test above exercises /admin/blog/new.
 */
async function fillProjectLocales(page: import("@playwright/test").Page) {
  for (const [locale, tab] of [
    ["en", "English"],
    ["fr", "Français"],
    ["ar", "العربية"],
  ] as const) {
    await page.getByRole("tab", { name: new RegExp(tab, "i") }).click();
    await page.fill(`input[name="name.${locale}"]`, "Placeholder");
    await page.fill(
      `textarea[name="summary.${locale}"]`,
      "Placeholder summary.",
    );
    await page.fill(
      `textarea[name="outcome.${locale}"]`,
      "Placeholder outcome.",
    );
  }
}

test("a new project cannot overwrite an existing one by reusing its slug", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/portfolio/new");
  // rentcar is seeded. Creating "new" over it used to write straight on top,
  // silently replacing a published case study.
  await page.fill('input[name="slug"]', "rentcar");
  await page.fill('input[name="tags"]', "Next.js");
  await page.fill('input[name="date"]', "2026");
  await fillProjectLocales(page);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(banner(page)).toContainText("already exists");

  // Still one project, still its original name.
  const existing = await rows<{ name: string }>(
    `SELECT t.name FROM projects p JOIN project_translations t ON t.project_id = p.id
      WHERE p.slug = ? AND t.locale = 'en'`,
    ["rentcar"],
  );
  expect(existing[0]?.name).toBe("RentCar");
  expect(await rows("SELECT id FROM projects")).toHaveLength(1);
});

test("a project cannot take an order another project already occupies", async ({
  signedIn: page,
}) => {
  await page.goto("/admin/portfolio/new");
  await page.fill('input[name="slug"]', "second-project");
  await page.fill('input[name="tags"]', "Next.js");
  await page.fill('input[name="date"]', "2026");
  /*
   * rentcar holds order 1. sort_order is UNIQUE, so the database would refuse
   * this regardless — the check in the action exists to name the offender
   * rather than show ER_DUP_ENTRY to someone writing a case study.
   */
  await page.fill('input[name="order"]', "1");
  await fillProjectLocales(page);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(banner(page)).toContainText("already used by");
  await expect(banner(page)).toContainText("rentcar");
  expect(await rows("SELECT id FROM projects")).toHaveLength(1);
});
