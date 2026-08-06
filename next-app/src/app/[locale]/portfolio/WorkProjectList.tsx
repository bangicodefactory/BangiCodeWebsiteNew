"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { WorkFilter, FILTER_VALUES, type FilterValue } from "./WorkFilter";
import type { ProjectCardData } from "@/lib/portfolio-schema";

/*
 * Projects arrive as props rather than being imported.
 *
 * This is a client component (useSearchParams for the ?filter= param) and the
 * project data now lives on disk under content/portfolio/, so it cannot import
 * the loader — fs is server-only. The server page reads and localises, this
 * renders and filters.
 */
export function WorkProjectList({ projects }: { projects: ProjectCardData[] }) {
  const t = useTranslations("Work");
  const searchParams = useSearchParams();

  const rawFilter = searchParams.get("filter");
  const activeFilter: FilterValue = FILTER_VALUES.includes(
    rawFilter as FilterValue,
  )
    ? (rawFilter as FilterValue)
    : "all";

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const filterLabels: Record<FilterValue, string> = {
    all: t("filterAll"),
    software: t("filterSoftware"),
    ecommerce: t("filterEcommerce"),
    web: t("filterWeb"),
    social: t("filterSocial"),
  };

  return (
    <section
      aria-labelledby="work-grid-heading"
      className="border-border border-t py-16 sm:py-20"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
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
                    href={`/portfolio/${project.slug}`}
                    className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {project.name}
                  </Link>
                </h2>

                <p className="font-body text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                  {project.summary}
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
  );
}
