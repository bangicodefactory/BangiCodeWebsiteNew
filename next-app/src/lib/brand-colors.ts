/**
 * Literal brand hex values, for the few places CSS custom properties cannot reach.
 *
 * `next/og` ImageResponse (opengraph-image.tsx) renders with inline styles
 * outside the Tailwind pipeline, so it cannot read `var(--color-navy-700)`. It
 * must hardcode hex — this module exists so those literals live in exactly one
 * place and cannot silently drift from `src/styles/tokens.css` the way the old
 * `#002058` / `#5cb8fd` pair did.
 *
 * The root not-found.tsx used to be the other caller. It now imports
 * globals.css and uses token classes like every other page, which is the better
 * answer wherever it is available.
 *
 * ⚠ Keep in sync with src/styles/tokens.css. See
 *   docs/adr/0001-adopt-claude-design-system-tokens.md
 *
 * Everywhere else, use the token classes (bg-primary, text-accent, bg-spark, …).
 */
export const BRAND = {
  /** --color-navy-700 — structure. Also the logo wordmark navy. */
  navy: "#114483",
  /** --color-sky-500 — accent. Also the logo wordmark blue. */
  sky: "#2e91ce",
  /** --color-red-500 — the spark. Also the logo "S" red. */
  spark: "#d30f33",
  /** --color-ink-950 — deep navy-black used for dark bands. */
  ink950: "#0b111a",
  /** --color-ink-600 — muted body text on light surfaces. */
  ink600: "#526074",
  white: "#ffffff",
} as const;
