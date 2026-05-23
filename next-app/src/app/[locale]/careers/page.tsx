import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Careers" });
  return { title: t("h1"), description: t("subhead") };
}

const HIRE_STEPS = ["hire01", "hire02", "hire03"] as const;
const WORK_ITEMS = ["work01", "work02", "work03", "work04"] as const;
const PRACTICES = ["software", "ecommerce", "training", "social"] as const;
const PRACTICE_KEYS = {
  software: "practiceSoftware",
  ecommerce: "practiceEcommerce",
  training: "practiceTraining",
  social: "practiceSocial",
} as const;

export default async function CareersPage() {
  const t = await getTranslations("Careers");

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
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

      {/* How we hire */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase"
          >
            {t("hireEyebrow")}
          </p>
          <h2 className="font-display text-foreground mb-12 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("hireH2")}
          </h2>

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HIRE_STEPS.map((key, i) => (
              <li key={key} className="flex flex-col gap-3">
                <span
                  aria-hidden="true"
                  className="text-muted-foreground font-mono text-4xl font-bold tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-foreground text-lg font-semibold">
                  {t(`${key}Title`)}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t(`${key}Body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you'll do */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase"
          >
            {t("workEyebrow")}
          </p>
          <h2 className="font-display text-foreground mb-12 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("workH2")}
          </h2>

          <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
            {WORK_ITEMS.map((key) => (
              <div key={key} className="bg-background flex flex-col gap-3 p-6">
                <h3 className="font-display text-foreground text-base font-semibold">
                  {t(`${key}Title`)}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t(`${key}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase"
          >
            {t("rolesEyebrow")}
          </p>
          <h2 className="font-display text-foreground mb-12 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("rolesH2")}
          </h2>

          {/* Empty state */}
          <div className="bg-surface-container rounded-sm p-8 sm:p-12">
            <div className="mx-auto max-w-xl text-center">
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {PRACTICES.map((practice) => (
                  <Badge key={practice} variant="secondary">
                    {t(PRACTICE_KEYS[practice])}
                  </Badge>
                ))}
              </div>
              <p className="font-body text-muted-foreground text-base leading-relaxed">
                {t("rolesEmpty")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-foreground mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("ctaH2")}
            </h2>
            <p className="font-body text-muted-foreground mb-8 text-lg">
              {t("ctaBody")}
            </p>
            <Button asChild variant="primary" size="lg">
              <Link href="/contact?topic=careers">{t("ctaButton")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
