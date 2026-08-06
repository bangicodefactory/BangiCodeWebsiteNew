import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/*
 * Design D's product row. Per decision 4 these four are ILLUSTRATIVE — they are
 * platform shapes that recur in client work, not products you can buy today.
 *
 * Every card carries data-placeholder="true" (the same grep-able convention
 * TestimonialsSection uses) and the section states it in visible copy, so the
 * page never implies a catalogue that doesn't exist. Remove both when real
 * product pages ship.
 *
 * The CTA points at /contact rather than /solutions — that route arrives in
 * Phase 6; linking early would 404.
 */
export async function SolutionsSection() {
  const t = await getTranslations("Home.solutions");

  const products = [
    { name: t("p01Name"), tag: t("p01Tag"), body: t("p01Body") },
    { name: t("p02Name"), tag: t("p02Tag"), body: t("p02Body") },
    { name: t("p03Name"), tag: t("p03Tag"), body: t("p03Body") },
    { name: t("p04Name"), tag: t("p04Tag"), body: t("p04Body") },
  ];

  return (
    <section
      id="solutions"
      className="border-border bg-surface-container border-y py-16 sm:py-24"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h2 className="font-display text-foreground mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("headline")}
        </h2>
        <p className="font-body text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed">
          {t("body")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <article
              key={p.name}
              data-placeholder="true"
              className="border-border bg-card flex flex-col gap-3 rounded-md border p-6 shadow-xs"
            >
              <span className="text-muted-foreground bg-muted w-fit rounded-full px-2.5 py-1 font-mono text-xs">
                {p.tag}
              </span>
              <h3 className="font-display text-foreground text-lg font-bold tracking-tight">
                {p.name}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {p.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild variant="outline">
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
