import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProjects, toCardData } from "@/lib/portfolio";
import { WorkProjectList } from "./WorkProjectList";

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

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Work");

  // Read on the server, localise here, hand plain data to the client filter.
  const projects = getProjects().map((p) => toCardData(p, locale));

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

      {/* Filter + grid — client component; Suspense required for useSearchParams */}
      <Suspense>
        <WorkProjectList projects={projects} />
      </Suspense>
    </div>
  );
}
