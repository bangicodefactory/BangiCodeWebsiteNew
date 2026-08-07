import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { buildAlternates } from "@/lib/alternates";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Process" });
  return {
    title: t("h1"),
    description: t("subhead"),
    alternates: buildAlternates("/process", locale),
  };
}

const STEPS = ["step01", "step02", "step03", "step04"] as const;
const DETAILS = ["Detail01", "Detail02", "Detail03"] as const;
const PRINCIPLES = ["prin01", "prin02", "prin03"] as const;

export default async function ProcessPage() {
  const t = await getTranslations("Process");

  return (
    <div>
      {/* Hero */}
      <section className="max-w-content mx-auto px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("h1")}
        </h1>
        <p className="font-body text-muted-foreground max-w-xl text-lg">
          {t("subhead")}
        </p>
      </section>

      {/* Steps + sticky ToC */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
            {/* Sticky ToC — hidden on mobile */}
            <nav aria-label={t("tocLabel")} className="hidden lg:block">
              <ul className="sticky top-24 flex flex-col gap-2">
                {STEPS.map((key) => (
                  <li key={key}>
                    <a
                      href={`#${key}`}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {t(`${key}Nav`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Step sections */}
            <div className="flex flex-col gap-0 lg:col-span-3">
              {STEPS.map((key) => (
                <article
                  key={key}
                  id={key}
                  className="border-border scroll-mt-24 border-t py-16 first:border-t-0 first:pt-0"
                >
                  <div className="mb-6 flex items-baseline gap-4">
                    <span
                      dir="ltr"
                      className="text-secondary-container font-mono text-xs"
                    >
                      {t(`${key}Number`)}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {t(`${key}Time`)}
                    </span>
                  </div>
                  <h2 className="font-display text-foreground mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {t(`${key}Title`)}
                  </h2>
                  <p className="font-body text-muted-foreground mb-8 max-w-prose text-base leading-relaxed">
                    {t(`${key}Body`)}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {DETAILS.map((d) => (
                      <li
                        key={d}
                        className="text-muted-foreground flex items-start gap-3 font-mono text-sm"
                      >
                        <Check
                          className="text-secondary-container mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {t(`${key}${d}`)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-10 font-mono text-xs tracking-widest uppercase"
          >
            {t("principlesEyebrow")}
          </p>
          <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-3">
            {PRINCIPLES.map((key) => (
              <article
                key={key}
                className="bg-background flex flex-col gap-3 p-8"
              >
                <h2 className="font-display text-foreground text-lg font-bold">
                  {t(`${key}Title`)}
                </h2>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t(`${key}Body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="max-w-content mx-auto px-4 text-center sm:px-6">
          <h2 className="font-display text-primary-foreground mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("ctaHeadline")}
          </h2>
          <Button asChild variant="secondary" size="lg">
            <Link href="/contact">{t("ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
