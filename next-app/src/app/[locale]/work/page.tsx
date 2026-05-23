import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { WorkFilter, FILTER_VALUES, type FilterValue } from "./WorkFilter";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Work" });
  return { title: t("h1"), description: t("subhead") };
}

const PROJECTS = [
  {
    slug: "rentcar",
    key: "rentcar",
    category: "software" as const,
    tags: ["Next.js", "Stripe", "PostgreSQL"],
  },
  {
    slug: "friterie-ma",
    key: "friterieMa",
    category: "software" as const,
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    slug: "classkom",
    key: "classkom",
    category: "software" as const,
    tags: ["React Native", "Firebase"],
  },
  {
    slug: "nortecoffeeco",
    key: "nortecoffeeco",
    category: "software" as const,
    tags: ["Next.js", "Sanity"],
  },
  {
    slug: "ayaalmadina",
    key: "ayaalmadina",
    category: "software" as const,
    tags: ["Laravel", "MySQL"],
  },
  {
    slug: "coinluminaire",
    key: "coinluminaire",
    category: "ecommerce" as const,
    tags: ["Shopify", "Liquid"],
  },
  {
    slug: "cafeimperial",
    key: "cafeimperial",
    category: "web" as const,
    tags: ["Next.js", "Headless CMS"],
  },
  {
    slug: "aqarchamal",
    key: "aqarchamal",
    category: "web" as const,
    tags: ["Next.js", "Mapbox"],
  },
  {
    slug: "fujiwara",
    key: "fujiwara",
    category: "social" as const,
    tags: ["Instagram", "Video"],
  },
  {
    slug: "alaturco",
    key: "alaturco",
    category: "social" as const,
    tags: ["Social Media", "Photography"],
  },
  {
    slug: "riha-ma",
    key: "rihaMa",
    category: "social" as const,
    tags: ["TikTok", "Reels"],
  },
  {
    slug: "cosas-buenas",
    key: "cosasbuenas",
    category: "social" as const,
    tags: ["Instagram", "Content"],
  },
] as const;

type Project = (typeof PROJECTS)[number];

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const activeFilter: FilterValue = FILTER_VALUES.includes(
    rawFilter as FilterValue,
  )
    ? (rawFilter as FilterValue)
    : "all";

  const filtered: readonly Project[] =
    activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeFilter);

  const t = await getTranslations("Work");

  const filterLabels: Record<FilterValue, string> = {
    all: t("filterAll"),
    software: t("filterSoftware"),
    ecommerce: t("filterEcommerce"),
    web: t("filterWeb"),
    social: t("filterSocial"),
  };

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

      {/* Filter + grid */}
      <section
        aria-labelledby="work-grid-heading"
        className="border-border border-t py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="work-grid-heading" className="sr-only">
            {t("h1")}
          </h2>
          <WorkFilter
            currentFilter={activeFilter}
            labels={filterLabels}
            ariaLabel={t("filterLabel")}
          />

          {filtered.length === 0 ? (
            <div className="bg-surface-container mt-12 rounded-sm p-8 text-center">
              <p className="font-body text-muted-foreground text-base">
                {t("emptyState")}{" "}
                <Link
                  href="/contact"
                  className="text-secondary-container underline underline-offset-4 hover:opacity-80"
                >
                  {t("emptyStateLink")}
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <article
                  key={project.slug}
                  className="border-border bg-background hover:border-secondary-container flex flex-col rounded-sm border p-6 transition hover:shadow-md"
                >
                  <h2 className="font-display text-foreground mb-2 text-lg font-semibold">
                    <Link
                      href={`/work/${project.slug}`}
                      className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {t(`${project.key}Name`)}
                    </Link>
                  </h2>

                  <p className="font-body text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                    {t(`${project.key}Summary`)}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p
                    aria-hidden="true"
                    className="text-secondary-container mt-4 font-mono text-xs"
                  >
                    {t("viewCase")} →
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
