import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroGridGlow } from "@/components/sections/HeroGridGlow";

/*
 * Design D's hero: a dark navy band, centred, with a mono eyebrow between two
 * short spark rules and a two-line display headline whose second line is sky.
 *
 * Copy is unchanged from the previous two-column hero — decision 3 takes D's
 * layout and visual language, not its agency voice.
 *
 * The texture is pure CSS (a navy grid under a radial mask, plus one blurred
 * spark bloom). Deliberately not an image: this is the LCP band and the budget
 * is LCP < 2.0s from EU/MENA.
 */
export async function HeroSection() {
  const t = await getTranslations("Home.hero");

  return (
    <section
      id="hero"
      data-surface="dark"
      className="bg-background relative isolate overflow-hidden"
    >
      {/* grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--color-navy-900)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-navy-900)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)] [background-size:80px_80px]"
      />
      {/*
       * The same grid in sky, lit under the pointer. A later sibling at the
       * same -z-10, so it paints over the navy grid and still sits behind the
       * copy. Client-side and purely additive — see HeroGridGlow.
       */}
      <HeroGridGlow />
      {/* spark bloom — the ~5% of red this band is allowed */}
      <div
        aria-hidden="true"
        className="bg-spark/15 pointer-events-none absolute -top-32 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
      />

      <div className="max-w-content mx-auto px-4 pt-20 pb-10 text-center sm:px-6 sm:pt-28 sm:pb-14">
        <p className="text-muted-foreground flex items-center justify-center gap-3 font-mono text-xs tracking-widest uppercase">
          <span aria-hidden="true" className="bg-spark h-px w-6 sm:w-10" />
          {t("eyebrow")}
          <span aria-hidden="true" className="bg-spark h-px w-6 sm:w-10" />
        </p>

        {/*
         * Two block spans, not `{h1}<br/><span>{tagline}</span>`.
         *
         * Two reasons. First, `<br>` contributes nothing to textContent, so the
         * accessible name and every scraper read "Morocco.Fast to ship" with no
         * space — hence the explicit {" "} between them, which collapses to
         * nothing visually between two blocks but survives text extraction.
         *
         * Second, `text-wrap: balance` balances a block's own lines. On one
         * block split by a <br> the French headline balanced across all four
         * lines and left "dure." alone on the last one; per-span it balances
         * each sentence separately, which is what the design wants anyway.
         *
         * lg:max-w-[68rem] is what gets the CTA above the fold in French.
         * Balancing alone fixed the orphan but not the height — FR still ran to
         * four lines, putting the CTA at y=737 and the microcopy at y=773 on a
         * 1366×768 laptop, i.e. both below the fold. Measured single-line widths
         * at text-7xl: FR tagline 1016px, EN headline 1239px, FR headline
         * 1602px. At the old 896px cap the FR tagline wrapped to two lines; at
         * 1088px it fits on one and FR drops to three lines, while both
         * headlines stay comfortably over the cap and keep wrapping to two — so
         * EN and AR line counts are unchanged. 5xl (1024px) would also fit the
         * FR tagline, but with 8px to spare, which one copy edit or font-metric
         * shift would undo.
         */}
        <h1 className="font-display text-foreground mx-auto mt-8 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:max-w-[68rem] lg:text-7xl">
          <span className="block text-balance">{t("h1")}</span>{" "}
          <span className="text-secondary-container block text-balance">
            {t("tagline")}
          </span>
        </h1>

        <p className="font-body text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {t("body")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {/*
           * /contact, not /book. This button and the nav button carry the same
           * label ("Start a project") and the same spark pill, so they have to
           * land in the same place — the nav one has always gone to /contact.
           * The calendar is still reachable from "Book 30 min" in the closing
           * band and from /book directly.
           */}
          <Button asChild variant="spark" size="lg">
            <Link href="/contact">{t("ctaPrimary")}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#work">{t("ctaSecondary")}</Link>
          </Button>
        </div>

        <p className="text-muted-foreground mt-5 font-mono text-xs">
          {t("microcopy")}
        </p>
      </div>
    </section>
  );
}
