import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Locale } from "@/i18n/routing";
import { getProject } from "@/lib/portfolio";
import { CaseStudyViewTracker } from "@/components/CaseStudyViewTracker";
import { buildAlternates } from "@/lib/alternates";

/*
 * Empty, deliberately — see ADR 0003 and the note in blog/[slug]/page.tsx.
 * The build cannot reach the production database, and prerendering CI's seed
 * content would ship fixtures. Pages render on first request and are cached
 * under the `projects` tag until a publish invalidates it.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  const c = project.content[locale as Locale] ?? project.content.en;
  return {
    title: c.name,
    description: c.summary,
    alternates: buildAlternates(`/portfolio/${slug}`, locale),
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
  setRequestLocale(locale);
  const project = await getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("Work");
  // Copy comes from the project file now, not from Work.<key>*.
  const c = project.content[locale as Locale] ?? project.content.en;
  const categoryKey = CATEGORY_LABEL_KEY[project.category];
  const hero = project.hero;

  return (
    <div>
      <CaseStudyViewTracker slug={project.slug} practice={project.category} />
      {/* Back nav */}
      <div className="max-w-content mx-auto px-4 pt-8 sm:px-6">
        <Link
          href="/portfolio"
          className="text-muted-foreground focus-visible:ring-ring hover:text-foreground rounded-sm font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {locale === "ar" ? "→" : "←"} {t("backToWork")}
        </Link>
      </div>

      {/* Header */}
      <section className="max-w-content mx-auto px-4 pt-12 pb-8 sm:px-6">
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
          {c.name}
        </h1>
      </section>

      {/*
       * Hero image.
       *
       * No bg on this wrapper. It carried `bg-surface-container` while the
       * placeholder inside carries the same token, so the grey band painted out
       * to the wrapper's own edge (x=60 at 1440) while the header above it sat
       * at the padded edge (x=84). Two grey rectangles, one nested in the other,
       * reading as a single misaligned one. The inner element owns the fill.
       */}
      <div className="max-w-content mx-auto px-4 sm:px-6">
        {!hero.placeholder ? (
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
            aria-label={c.name}
            role="img"
            data-placeholder="true"
          >
            <span
              aria-hidden="true"
              className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
            >
              {c.name}
            </span>
          </div>
        )}
      </div>

      {/*
       * Body.
       *
       * The measure stays max-w-3xl — that is the readable line length and it
       * should not change. What changed is where it starts: this used to be
       * `mx-auto max-w-3xl`, which centred the column and put its left edge at
       * x=360 while the breadcrumb, the h1 and the image all began at x=84.
       * Three left edges on a page with five elements. Now the outer wrapper
       * shares the page gutter and the measure is capped inside it.
       */}
      <section className="max-w-content mx-auto px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          {/* Summary */}
          <p className="font-body text-foreground mb-8 text-lg leading-relaxed">
            {c.summary}
          </p>

          {/* Stack strip */}
          <div className="mb-8">
            <p className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
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
            <p className="text-muted-foreground mb-1 font-mono text-xs tracking-widest uppercase">
              {t("outcomeLabel")}
            </p>
            <p className="font-body text-foreground text-base font-medium">
              {c.outcome}
            </p>
          </div>

          {/*
           * CTA. This label is a full sentence — CLAUDE.md locks it as "Full case
           * study available on request — contact us" — and Button's base carries
           * whitespace-nowrap, which is fine for the two-word labels everywhere
           * else. At 390px it measured 412px wide in EN and 540px in FR, pushing
           * the whole page into horizontal scroll. Allow this one to wrap and let
           * the height follow instead of overriding the primitive for everyone.
           */}
          <Button
            asChild
            variant="spark"
            size="lg"
            className="h-auto max-w-full py-3 text-center whitespace-normal"
          >
            <Link href="/contact">{t("ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
