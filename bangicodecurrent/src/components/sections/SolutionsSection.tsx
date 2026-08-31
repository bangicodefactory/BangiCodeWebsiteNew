import { getTranslations } from "next-intl/server";
import { NewTabHint } from "@/components/NewTabHint";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DRIVEDESK } from "@/lib/solutions";

/*
 * Two tiers, and the split is the point.
 *
 * DriveDesk is a real product Bangicode built, ships and runs — it has a login,
 * a demo booking and paying-customer plumbing. It gets the featured panel, an
 * outbound link to its own domain, and NO data-placeholder attribute.
 *
 * The three below it are still ILLUSTRATIVE: platform shapes that recur in
 * client work, built per client. They keep data-placeholder="true" and the
 * visible disclaimer — which now says "these three", because applying
 * "not sold off the shelf" to DriveDesk would be a false claim about a live
 * product. That contradiction (a section disclaiming itself twice) was the
 * reason this section never read straight.
 */
export async function SolutionsSection() {
  const t = await getTranslations("Home.solutions");

  const patterns = [
    { name: t("p02Name"), tag: t("p02Tag"), body: t("p02Body") },
    { name: t("p03Name"), tag: t("p03Tag"), body: t("p03Body") },
    { name: t("p04Name"), tag: t("p04Tag"), body: t("p04Body") },
  ];

  return (
    <section
      id="solutions"
      className="border-border bg-surface-container border-y py-20 sm:py-28 lg:py-32"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="font-display text-foreground mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("headline")}
        </h2>
        <p className="font-body text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed text-pretty">
          {t("body")}
        </p>

        {/* ── DriveDesk: the real one ─────────────────────────────────────── */}
        {/*
         * rounded-xl (28px). This is the largest single surface on the page and
         * the only one carrying a badge, a headline, a tagline, a paragraph, six
         * chips and a call to action — "large feature panel" in CLAUDE.md's own
         * radius table.
         *
         * The chips inside are `rounded-full` against 32–40px of padding. That
         * is past the point where concentric radius applies: at more than ~24px
         * of separation the two are read as separate surfaces, not as one shape
         * inside another, so each picks its own radius.
         */}
        <article
          data-surface="dark"
          className="reveal border-secondary bg-background mt-12 rounded-xl border p-8 sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-spark text-spark-foreground w-fit rounded-full px-2.5 py-1 font-mono text-xs">
              {t("ddBadge")}
            </span>
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              drivedesk.ma
            </span>
          </div>

          <h3 className="font-display text-foreground mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("ddName")}
          </h3>
          <p className="font-display text-secondary-container mt-2 text-lg font-bold tracking-tight text-balance sm:text-xl">
            {t("ddTagline")}
          </p>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
            {t("ddBody")}
          </p>

          {/*
           * Staggered, because six chips landing at once is a wall and six
           * landing in sequence is a feature list being read out. This is the
           * one product on the page a visitor can go and verify, so the chips
           * are worth the extra beat of attention.
           */}
          <ul className="reveal-stagger mt-6 flex list-none flex-wrap gap-2 p-0">
            {DRIVEDESK.featureKeys.map((k) => (
              <li
                key={k}
                className="border-border text-foreground/80 rounded-full border px-3 py-1 font-mono text-xs"
              >
                {t(k)}
              </li>
            ))}
          </ul>

          {/*
           * A plain <a>, not next-intl's <Link>: this leaves the site, so it
           * must not be locale-prefixed. target=_blank keeps the visitor's
           * place on bangicode.ma, and rel=noopener is required with it.
           */}
          <div className="mt-8">
            <Button asChild variant="spark" shape="pill">
              <a href={DRIVEDESK.url} target="_blank" rel="noopener noreferrer">
                {t("ddCta")}
                <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
                <NewTabHint />
              </a>
            </Button>
          </div>
        </article>

        {/* ── The three patterns: still illustrative ──────────────────────── */}
        <p className="text-muted-foreground mt-12 font-mono text-xs tracking-widest uppercase">
          {t("patternsLabel")}
        </p>

        <div className="reveal-stagger mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((p) => (
            <article
              key={p.name}
              data-placeholder="true"
              className="border-border bg-card flex flex-col gap-3 rounded-lg border p-6 shadow-xs"
            >
              <span className="text-muted-foreground bg-muted w-fit rounded-full px-2.5 py-1 font-mono text-xs">
                {p.tag}
              </span>
              <h3 className="font-display text-foreground text-lg font-bold tracking-tight">
                {p.name}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed text-pretty">
                {p.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild variant="outline" shape="pill">
            <Link href="/contact">{t("cta")}</Link>
          </Button>
          <p className="text-muted-foreground font-mono text-xs">
            {t("placeholder")}
          </p>
        </div>
      </div>
    </section>
  );
}
