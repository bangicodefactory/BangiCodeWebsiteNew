import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { DRIVEDESK } from "@/lib/solutions";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ThesisLineStats } from "@/components/sections/ThesisLineStats";
import { FounderCard } from "@/components/sections/FounderCard";
import { organizationSchema } from "@/lib/json-ld";
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
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("h1"),
    description: t("subhead"),
    alternates: buildAlternates("/about", locale),
  };
}

const VALUES = ["val01", "val02", "val03"] as const;

export default async function AboutPage() {
  const t = await getTranslations("About");
  const meta = await getTranslations("Meta");

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema(meta("description"))),
        }}
      />
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

      {/* Stats */}
      {/* showProduct={false}: DriveDesk appears in the founding-story column
          below, and this page renders the same stats band as the home page. */}
      <ThesisLineStats showProduct={false} />

      {/* Story */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p
                dir="ltr"
                className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase"
              >
                {t("storyEyebrow")}
              </p>
              <h2 className="font-display text-foreground mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
                {t("storyHeadline")}
              </h2>
              <p className="font-body text-muted-foreground text-base leading-relaxed">
                {t("storyBody")}
              </p>
            </div>

            <aside className="bg-surface-container p-8">
              <dl className="flex flex-col gap-6">
                <div>
                  <dt className="text-muted-foreground mb-1 font-mono text-xs">
                    {t("storySince")}
                  </dt>
                  <dd className="font-display text-primary text-3xl font-bold">
                    {t("storySinceValue")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1 font-mono text-xs">
                    {t("storySize")}
                  </dt>
                  <dd className="font-display text-foreground text-xl font-bold">
                    {t("storySizeValue")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1 font-mono text-xs">
                    {t("storyPractices")}
                  </dt>
                  <dd className="font-display text-primary text-3xl font-bold">
                    {t("storyPracticesValue")}
                  </dd>
                </div>
                {/*
                 * The story above talks about how we treat clients. This is the
                 * one entry in the column that is not a number about ourselves:
                 * a product we built and run, that the reader can go and look
                 * at. Plain <a> — it leaves the site, so no locale prefix.
                 */}
                <div>
                  <dt className="text-muted-foreground mb-1 font-mono text-xs">
                    {t("storyProduct")}
                  </dt>
                  <dd className="font-display text-primary text-3xl font-bold">
                    <a
                      href={DRIVEDESK.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {t("storyProductValue")}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 rtl:-scale-x-100"
                      />
                    </a>
                  </dd>
                  <p className="font-body text-muted-foreground mt-1 text-sm">
                    {t("storyProductNote")}
                  </p>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-10 font-mono text-xs tracking-widest uppercase"
          >
            {t("valuesEyebrow")}
          </p>
          <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-3">
            {VALUES.map((key) => (
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

      {/* Team */}
      <section className="bg-surface-container py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
          >
            {t("teamEyebrow")}
          </p>
          <h2 className="font-display text-foreground mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("teamHeadline")}
          </h2>
          <p className="font-body text-muted-foreground text-base">
            {t("teamBody")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border border-t py-16 sm:py-24">
        <div className="max-w-content mx-auto px-4 text-center sm:px-6">
          <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("ctaHeadline")}
          </h2>
          <Button asChild variant="primary" size="lg">
            <Link href="/contact">{t("ctaButton")}</Link>
          </Button>
        </div>
      </section>

      {/* Founder contact */}
      <FounderCard />
    </div>
  );
}
