import { test, expect, getCommits } from "./support";

/*
 * The CMS's publishing contract, asserted against what actually reaches the
 * repository — not just against what the UI says happened.
 *
 * The properties here are the ones that are invisible from the screen and only
 * show up in production: a post half-published across locales, a commit that
 * quietly drops the rest of the repo, an edit that overwrites the translations
 * it was not touching.
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

test("an incomplete post is refused and commits nothing", async ({
  signedIn: page,
  request,
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
  // The important half: nothing reached the repository.
  expect(await getCommits(request)).toHaveLength(0);
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

test("publishing writes every locale in ONE commit", async ({
  signedIn: page,
  request,
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

  const commits = await getCommits(request);
  expect(commits).toHaveLength(1);

  const commit = commits[0];
  expect(commit.files.map((f) => f.path).sort()).toEqual([
    `content/blog/ar/${SLUG}.mdx`,
    `content/blog/en/${SLUG}.mdx`,
    `content/blog/fr/${SLUG}.mdx`,
  ]);
  // Layered on the existing tree — without base_tree this would wipe the repo.
  expect(commit.baseTree).toBeTruthy();
  // Attributed to the person, not a bot.
  expect(commit.author?.email).toBe("ahmed@users.noreply.github.com");

  const arabic = commit.files.find((f) => f.path.includes("/ar/"));
  expect(arabic?.content).toContain("نحدد النطاق");
  expect(arabic?.content).toMatch(/^---\n/); // frontmatter survived
});

test("a duplicate slug is refused rather than overwriting", async ({
  signedIn: page,
  request,
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
  expect(await getCommits(request)).toHaveLength(0);
});

test("editing a project touches one file and leaves other locales intact", async ({
  signedIn: page,
  request,
}) => {
  await page.goto("/admin/portfolio/rentcar");
  await page.fill('input[name="name.en"]', "RentCar.ma");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(okBanner(page)).toContainText("Project updated");

  const commits = await getCommits(request);
  expect(commits).toHaveLength(1);
  expect(commits[0].files).toHaveLength(1);
  expect(commits[0].files[0].path).toBe("content/portfolio/rentcar.json");

  const written = commits[0].files[0].content ?? "";
  expect(written).toContain('"name": "RentCar.ma"');
  // The French and Arabic blocks were never on screen — they must survive.
  expect(written).toContain("FR résumé.");
  expect(written).toContain("ملخص.");
  // And it must still satisfy the schema the site loads with.
  expect(() => JSON.parse(written)).not.toThrow();
});

test("deleting requires typing the slug, then removes every locale at once", async ({
  signedIn: page,
  request,
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

  const commits = await getCommits(request);
  expect(commits).toHaveLength(1);
  expect(commits[0].files).toHaveLength(3);
  expect(commits[0].files.every((f) => f.deleted)).toBe(true);
});

test("the blog list flags a post that is not live in every locale", async ({
  signedIn: page,
  request,
}) => {
  // Publish, then delete just the Arabic file behind the CMS's back to
  // simulate a partial state arriving from a hand edit.
  await page.goto("/admin/blog");
  await expect(page.getByText("seeded-post")).toBeVisible();
  const commits = await getCommits(request);
  expect(commits).toHaveLength(0); // listing must not write anything
});

/*
 * The two cross-file rules Zod cannot enforce, because neither is a property of
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
  request,
}) => {
  await page.goto("/admin/portfolio/new");
  // rentcar is seeded. Creating "new" over it used to commit straight on top,
  // silently replacing a published case study.
  await page.fill('input[name="slug"]', "rentcar");
  await page.fill('input[name="tags"]', "Next.js");
  await page.fill('input[name="date"]', "2026");
  await fillProjectLocales(page);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(banner(page)).toContainText("already exists");
  expect(await getCommits(request)).toHaveLength(0);
});

test("a project cannot take an order another project already occupies", async ({
  signedIn: page,
  request,
}) => {
  await page.goto("/admin/portfolio/new");
  await page.fill('input[name="slug"]', "second-project");
  await page.fill('input[name="tags"]', "Next.js");
  await page.fill('input[name="date"]', "2026");
  // rentcar holds order 1. src/lib/portfolio.ts THROWS on a duplicate, so
  // accepting this would commit cleanly and then break the next build.
  await page.fill('input[name="order"]', "1");
  await fillProjectLocales(page);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(banner(page)).toContainText("already used by");
  await expect(banner(page)).toContainText("rentcar");
  expect(await getCommits(request)).toHaveLength(0);
});
