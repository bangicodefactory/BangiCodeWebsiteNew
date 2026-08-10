import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { buildAlternates } from "@/lib/alternates";
import { SOLUTIONS } from "@/lib/solutions";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Solutions" });
  return {
    title: t("h1"),
    description: t("subhead"),
    alternates: buildAlternates("/solutions", locale),
  };
}

export default async function SolutionsPage() {
  const t = await getTranslations("Solutions");

  return (
    <div>
      <section className="max-w-content mx-auto px-4 pt-24 pb-12 sm:px-6 sm:pt-32">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-foreground mb-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {t("h1")}
        </h1>
        <p className="font-body text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {t("subhead")}
        </p>

        {/* Stated in visible copy, not just in a data attribute — these four are
            patterns, and the page must never imply a catalogue that exists. */}
        <p
          data-placeholder="true"
          className="border-secondary text-muted-foreground font-body mt-8 max-w-2xl border-s-2 ps-4 text-sm leading-relaxed"
        >
          {t("placeholderNote")}
        </p>
      </section>

      <section className="max-w-content mx-auto px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/solutions/${s.slug}`}
              data-placeholder="true"
              className="group border-border bg-card hover:border-secondary focus-visible:ring-ring transition-interactive flex flex-col gap-3 rounded-md border p-8 shadow-xs hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="text-muted-foreground bg-muted w-fit rounded-full px-2.5 py-1 font-mono text-xs">
                {t(`${s.key}Tag`)}
              </span>
              <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                {t(`${s.key}Name`)}
              </h2>
              <p className="font-body text-muted-foreground grow text-sm leading-relaxed">
                {t(`${s.key}Summary`)}
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
      </section>

      <section data-surface="dark" className="bg-background py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 text-center sm:px-6">
          <h2 className="font-display text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {t("ctaHeadline")}
          </h2>
          <p className="font-body text-muted-foreground mx-auto mt-4 max-w-lg text-base leading-relaxed">
            {t("ctaBody")}
          </p>
          <div className="mt-8">
            <Button asChild variant="spark" size="lg">
              <Link href="/contact">{t("ctaButton")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
