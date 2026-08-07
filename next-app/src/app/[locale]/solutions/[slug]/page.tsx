import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { buildAlternates } from "@/lib/alternates";
import { routing } from "@/i18n/routing";
import { SOLUTIONS, findSolution } from "@/lib/solutions";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SOLUTIONS.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const solution = findSolution(slug);
  if (!solution) return {};
  const t = await getTranslations({ locale, namespace: "Solutions" });
  return {
    title: t(`${solution.key}Name`),
    description: t(`${solution.key}Summary`),
    alternates: buildAlternates(`/solutions/${slug}`, locale),
  };
}

/*
 * A platform pattern, not a product page. Every claim here is a capability the
 * studio actually delivers on client work — the page describes what a build in
 * this vertical typically contains, and says plainly that nothing is sold
 * off the shelf. See ADR 0001 and decision 4.
 */
export default async function SolutionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const solution = findSolution(slug);
  if (!solution) notFound();

  const t = await getTranslations("Solutions");
  const k = solution.key;
  const capabilities = [
    t(`${k}Cap01`),
    t(`${k}Cap02`),
    t(`${k}Cap03`),
    t(`${k}Cap04`),
  ];

  return (
    <div data-placeholder="true">
      <div className="max-w-content mx-auto px-4 pt-8 sm:px-6">
        <Link
          href="/solutions"
          className="text-muted-foreground focus-visible:ring-ring hover:text-foreground rounded-sm font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {locale === "ar" ? "→" : "←"} {t("backToSolutions")}
        </Link>
      </div>

      <section className="max-w-content mx-auto px-4 pt-12 pb-8 sm:px-6">
        <span className="text-muted-foreground bg-muted mb-5 inline-block rounded-full px-2.5 py-1 font-mono text-xs">
          {t(`${k}Tag`)}
        </span>
        <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
          {t(`${k}Name`)}
        </h1>
        <p className="font-body text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
          {t(`${k}Summary`)}
        </p>
      </section>

      <section className="max-w-content mx-auto px-4 pb-8 sm:px-6">
        <p
          dir="ltr"
          className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase"
        >
          {t("includedLabel")}
        </p>
        <ul className="grid max-w-3xl list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-3">
              <Check
                aria-hidden="true"
                className="text-accent mt-0.5 size-4 shrink-0"
              />
              <span className="font-body text-foreground text-sm leading-relaxed">
                {cap}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-content mx-auto px-4 pb-16 sm:px-6">
        <div className="max-w-3xl">
          <p
            dir="ltr"
            className="text-muted-foreground mb-2 font-mono text-xs tracking-widest uppercase"
          >
            {t("timelineLabel")}
          </p>
          <p className="font-body text-foreground text-base">
            {t("timelineValue")}
          </p>

          <p className="border-secondary text-muted-foreground font-body mt-8 border-s-2 ps-4 text-sm leading-relaxed">
            {t("placeholderNote")}
          </p>
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
