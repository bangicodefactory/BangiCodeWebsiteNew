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
  /** Canonical product site. Opened in a new tab. */
  url: "https://drivedesk.ma",
  /**
   * Message keys for the six feature chips, in display order, mirroring
   * drivedesk.ma's own feature grid. Shared so the home row and /solutions
   * cannot drift — they were two hand-written lists of the same six keys.
   *
   * The copy itself lives in the `Home.solutions` and `Solutions` catalogs
   * because it is translated, not configuration.
   *
   * NOTE: deliberately no `slug`. There is no /solutions/drivedesk route — the
   * product lives on its own domain and the card links out. A slug here read as
   * a promise of a route that returns 404.
   */
  featureKeys: ["ddF01", "ddF02", "ddF03", "ddF04", "ddF05", "ddF06"],
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
