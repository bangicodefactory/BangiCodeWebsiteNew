import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROJECTS } from "../projects";
import { getCaseHero } from "@/lib/work-manifest";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: "Work" });
  return {
    title: t(`${project.key}Name`),
    description: t(`${project.key}Summary`),
  };
}

const CATEGORY_LABEL_KEY = {
  software: "filterSoftware",
  ecommerce: "filterEcommerce",
  web: "filterWeb",
  social: "filterSocial",
} as const;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const t = await getTranslations("Work");
  const categoryKey = CATEGORY_LABEL_KEY[project.category];
  const outcomeKey = `${project.key}Outcome` as Parameters<typeof t>[0];
  const hero = getCaseHero(project.slug);

  return (
    <main id="main-content">
      {/* Back nav */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Link
          href="/work"
          className="text-muted-foreground focus-visible:ring-ring hover:text-foreground rounded-sm font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {locale === "ar" ? "→" : "←"} {t("backToWork")}
        </Link>
      </div>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{t(categoryKey)}</Badge>
          <span
            dir="ltr"
            className="text-muted-foreground font-mono text-xs tabular-nums"
          >
            {project.date}
          </span>
        </div>
        <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
          {t(`${project.key}Name`)}
        </h1>
      </section>

      {/* Hero image */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {hero && !hero.placeholder ? (
          <Image
            src={hero.webp}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            className="rounded-sm object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />
        ) : (
          <div
            className="bg-surface-container flex h-64 items-center justify-center rounded-sm sm:h-80"
            aria-label={t(`${project.key}Name`)}
            role="img"
            data-placeholder="true"
          >
            <span
              aria-hidden="true"
              className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
            >
              {t(`${project.key}Name`)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Summary */}
        <p className="font-body text-foreground mb-8 text-lg leading-relaxed">
          {t(`${project.key}Summary`)}
        </p>

        {/* Stack strip */}
        <div className="mb-8">
          <p
            dir="ltr"
            className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase"
          >
            {t("stackLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="font-mono uppercase"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div className="border-secondary-container mb-12 border-s-2 ps-4">
          <p
            dir="ltr"
            className="text-muted-foreground mb-1 font-mono text-xs tracking-widest uppercase"
          >
            {t("outcomeLabel")}
          </p>
          <p className="font-body text-foreground text-base font-medium">
            {t(outcomeKey)}
          </p>
        </div>

        {/* CTA */}
        <Button asChild variant="primary" size="lg">
          <Link href="/contact">{t("ctaButton")}</Link>
        </Button>
      </section>
    </main>
  );
}
