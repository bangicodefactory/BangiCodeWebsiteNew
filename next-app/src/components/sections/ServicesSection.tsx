import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/*
 * Four service cards. Design D shows these as separate cards that lift on
 * hover, rather than the flush 1px-gutter grid this used to be.
 *
 * Each card is a whole link now — the detail pages under /services/* already
 * existed and nothing on the homepage pointed at them.
 */
export async function ServicesSection() {
  const t = await getTranslations("Home.services");

  const services = [
    {
      number: t("s01Number"),
      title: t("s01Title"),
      body: t("s01Body"),
      href: "/services/software",
    },
    {
      number: t("s02Number"),
      title: t("s02Title"),
      body: t("s02Body"),
      href: "/services/ecommerce",
    },
    {
      number: t("s03Number"),
      title: t("s03Title"),
      body: t("s03Body"),
      href: "/services/training",
    },
    {
      number: t("s04Number"),
      title: t("s04Title"),
      body: t("s04Body"),
      href: "/services/social",
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("headline")}
        </h2>

        {/*
         * reveal-stagger, not reveal: four cards in one row all reach the same
         * scroll position at the same moment, so without the per-child range
         * offsets in globals.css they would arrive as one block and the
         * animation would read as the row being drawn rather than the cards.
         *
         * rounded-lg (20px), up from rounded-md (14px). CLAUDE.md files 20–28px
         * under "feature panels" and 14px under "cards"; a whole-card link that
         * carries a number, a title, a paragraph and its own call to action is
         * the former. The larger radius is also what lets the card read as a
         * surface rather than as a bordered rectangle.
         */}
        <div className="reveal-stagger mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((svc) => (
            <Link
              key={svc.number}
              href={svc.href}
              className="group border-border bg-card hover:border-secondary focus-visible:ring-ring transition-interactive flex flex-col gap-4 rounded-lg border p-6 shadow-xs duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <span dir="ltr" className="text-accent font-mono text-xs">
                {svc.number}
              </span>
              <h3 className="font-display text-foreground text-lg font-bold text-balance">
                {svc.title}
              </h3>
              <p className="font-body text-muted-foreground grow text-sm leading-relaxed text-pretty">
                {svc.body}
              </p>
              <span className="text-accent flex items-center gap-1.5 font-mono text-xs">
                {t("learnMore")}
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
