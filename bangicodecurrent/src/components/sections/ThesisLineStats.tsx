import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { NewTabHint } from "@/components/NewTabHint";
import { DRIVEDESK } from "@/lib/solutions";

/*
 * The stats strip that closes Design D's dark hero band. It is a separate
 * component (and a separate <section>) only because it was already one — it is
 * meant to read as the bottom of the hero, so it carries the same
 * data-surface="dark" and the same background, joined by a hairline.
 *
 * Order is D's: clients, projects, years. D had a fourth, "24/7 client support",
 * dropped on 2026-08-16 — a studio of this size cannot staff a round-the-clock
 * desk, and a promise the business cannot keep is worse than no promise.
 */
/**
 * @param showProduct - render the DriveDesk line under the stats. Default true
 *   (the home page). /about passes false: it renders this same component AND
 *   has its own DriveDesk entry in the founding-story column, where the fact
 *   sits better next to "founded 2020 / 12 people / four practices". Without
 *   this the product would appear twice on one page.
 */
export async function ThesisLineStats({
  showProduct = true,
}: {
  showProduct?: boolean;
}) {
  const t = await getTranslations("Home.thesis");

  const stats = [
    { value: t("clientsValue"), label: t("clientsLabel") },
    { value: t("projectsValue"), label: t("projectsLabel") },
    { value: t("yearsValue"), label: t("yearsLabel") },
  ];

  return (
    <section
      id="thesis"
      data-surface="dark"
      className="border-border bg-background border-t"
    >
      <div className="max-w-content mx-auto px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>

        <h2 className="font-display text-foreground mx-auto mt-4 max-w-2xl text-xl font-bold tracking-tight text-balance sm:text-2xl">
          {t("headline")}
        </h2>

        {/*
          Three across at every width. It was `grid-cols-2 sm:grid-cols-4`,
          which balanced with four stats — 2×2 on mobile, one row on desktop.
          With three, that leaves an orphan on the second mobile row and an
          empty fourth column pulling the row off-centre on desktop.
        */}
        {/*
         * tabular-nums on the values. These are three numbers set side by side
         * in a grid at 48px, and proportional digits give "20", "24" and "5"
         * three different optical widths under three centred labels — the kind
         * of misalignment that is invisible until you notice it and then cannot
         * be unseen. Tabular figures are what a numeric column wants.
         *
         * It also protects the /ar values, which are authored with the sign on
         * the far side to survive bidi; equal-width digits keep those from
         * drifting relative to their labels.
         */}
        <dl className="reveal-stagger border-border mt-12 grid grid-cols-3 gap-y-10 border-t pt-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2">
              <dt className="text-muted-foreground font-mono text-xs tracking-wider">
                {stat.label}
              </dt>
              <dd className="font-display text-secondary-container text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/*
         * DriveDesk, one screen below the hero.
         *
         * Everything above this line is a claim — 20+, 24+, 5y, "code that
         * lasts" — and a visitor has no way to check any of it until the
         * featured case, a screen further down. This is the one thing on the
         * page they can verify in a click: a product we built and run, live on
         * its own domain. It belongs where the claims are made, not only in
         * /solutions where someone has to go looking for it.
         *
         * A line, not a card. The stats are the point of this band; this sits
         * under them as a footnote with a link, so it adds ~90px rather than
         * pushing the whole page down.
         */}
        {showProduct && (
          <div className="border-border mt-10 border-t pt-8">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t("productLabel")}
            </p>
            <div className="mt-3 flex flex-col items-center justify-center gap-x-3 gap-y-2 sm:flex-row sm:flex-wrap">
              <span className="font-display text-foreground text-xl font-bold tracking-tight">
                {t("productName")}
              </span>
              <span className="font-body text-muted-foreground text-sm text-balance">
                {t("productBody")}
              </span>
            </div>
            {/* Plain <a>: leaves the site, so it must not be locale-prefixed. */}
            <a
              href={DRIVEDESK.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-container focus-visible:ring-ring mt-4 inline-flex items-center gap-1.5 rounded-sm py-1.5 font-mono text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("productCta")}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 rtl:-scale-x-100"
              />
              <NewTabHint />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
