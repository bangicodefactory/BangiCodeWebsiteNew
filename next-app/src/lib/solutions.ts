/**
 * What /solutions shows, in two tiers.
 *
 * DRIVEDESK is a real, shipping product that Bangicode built and runs. It has a
 * login, a demo booking, its own domain, and paying-customer plumbing
 * (multi-tenant, multi-currency, white-label). It is NOT illustrative, it is not
 * data-placeholder, and it must never sit under the "not sold off the shelf"
 * note — that note would be a false statement about a live product.
 *
 * SOLUTIONS are the remaining ILLUSTRATIVE patterns: shapes that recur across
 * client work, built per client, not products for sale. Everything rendering
 * them keeps `data-placeholder="true"` and the visible disclaimer.
 *
 * Copy lives in the `Solutions` message namespace under each `key` prefix, and
 * the homepage row seeds name/tag/summary from `Home.solutions` so the two
 * surfaces cannot describe the same platform differently.
 *
 * Note on key numbering: the pattern keys stay p02–p04 even though there are now
 * three of them. p01 was RentFlow, the invented placeholder DriveDesk replaced.
 * Renumbering would have meant ~90 key renames across three locale files for
 * zero user-visible change, in the same commit that introduces new product copy.
 */
export const DRIVEDESK = {
  slug: "drivedesk",
  /** Canonical product site. Opened in a new tab — see SolutionsSection. */
  url: "https://drivedesk.ma",
  /**
   * Message-key prefix inside `Home.solutions` and `Solutions`. The six feature
   * chips are `${key}F01`–`${key}F06` and mirror drivedesk.ma's own feature
   * grid; they live in the catalogs rather than here because they are
   * translated copy, not configuration.
   */
  key: "dd",
} as const;

export const SOLUTIONS = [
  { slug: "tableserve", key: "p02" },
  { slug: "scholaris", key: "p03" },
  { slug: "shopcore", key: "p04" },
] as const;

export type Solution = (typeof SOLUTIONS)[number];

export function findSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
