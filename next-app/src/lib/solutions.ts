/**
 * The four platform patterns shown under /solutions.
 *
 * These are ILLUSTRATIVE (a locked decision — see ADR 0001): patterns that
 * recur across client work, not products for sale. Everything that renders them
 * carries `data-placeholder="true"` and the pages say so in visible copy.
 *
 * Copy lives in the `Solutions` message namespace under the `key` prefix, whose
 * name/tag/summary are seeded from `Home.solutions` so the homepage row and
 * these pages cannot describe the same platform differently.
 */
export const SOLUTIONS = [
  { slug: "rentflow", key: "p01" },
  { slug: "tableserve", key: "p02" },
  { slug: "scholaris", key: "p03" },
  { slug: "shopcore", key: "p04" },
] as const;

export type Solution = (typeof SOLUTIONS)[number];

export function findSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
