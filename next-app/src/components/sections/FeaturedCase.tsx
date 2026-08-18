import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const RENTCAR_STACK = ["React", "Laravel", "MySQL", "AWS"] as const;

/*
 * Top half of Design D's dark portfolio band.
 *
 * D shows three equal project cards. That would have thrown away RentCar.ma's
 * four hard metrics (-60% / 3→1 / 14mo / 99.9%), which are the strongest proof
 * on the page — so the band leads with the featured case and PeekCards
 * continues it below on the same dark ground, joined by a hairline. One band,
 * two densities.
 */
export async function FeaturedCase() {
  const t = await getTranslations("Home.featuredCase");

  const metrics = [
    { value: t("adminTimeValue"), label: t("adminTimeLabel") },
    { value: t("vendorsValue"), label: t("vendorsLabel") },
    { value: t("maintainedValue"), label: t("maintainedLabel") },
    { value: t("uptimeValue"), label: t("uptimeLabel") },
  ];

  return (
    <section
      id="work"
      data-surface="dark"
      className="bg-background py-16 sm:py-24"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — client info */}
          <div className="flex flex-col gap-6">
            {/*
             * Block spans plus an explicit {" "}, for the same reason as the
             * hero h1: `<br>` adds nothing to textContent, so this heading
             * flattened to "RentCar.maEnd-to-end fleet management…" for the
             * accessible name and for anything scraping the page.
             */}
            <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-secondary-container block">
                {t("client")}
              </span>{" "}
              <span className="block text-balance">{t("headline")}</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {[...RENTCAR_STACK, t("industry")].map((tag) => (
                <span
                  key={tag}
                  className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 font-mono text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href="/contact"
              // inline-block + py-1.5: this measured 20px tall, under WCAG 2.2
              // SC 2.5.8's 24×24, and it is a standalone link rather than one
              // inside a sentence, so the inline exception does not apply.
              className="text-secondary-container focus-visible:ring-ring inline-block w-fit rounded-sm py-1.5 font-mono text-sm underline underline-offset-4 transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("cta")}
            </Link>
          </div>

          {/* Right — metrics */}
          <dl className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="border-border bg-card flex flex-col-reverse items-start gap-1 rounded-md border p-6"
              >
                <dt className="text-muted-foreground font-mono text-xs">
                  {m.label}
                </dt>
                <dd className="font-display text-secondary-container text-4xl font-bold tracking-tight">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
