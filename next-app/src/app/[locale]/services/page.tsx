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
  const t = await getTranslations({ locale, namespace: "Services.overview" });
  return {
    title: t("h1"),
    description: t("subhead"),
  };
}

const PRACTICES = [
  {
    key: "s01" as const,
    href: "/services/software",
    tags: ["Laravel", "Next.js", "Postgres", "Inertia"],
  },
  {
    key: "s02" as const,
    href: "/services/ecommerce",
    tags: ["Shopify", "WooCommerce", "Stripe", "Laravel"],
  },
  {
    key: "s03" as const,
    href: "/services/training",
    tags: ["React", "Laravel", "Git", "Docker"],
  },
  {
    key: "s04" as const,
    href: "/services/social",
    tags: ["Meta", "Instagram", "TikTok", "LinkedIn"],
  },
] as const;

const FAQS = [
  { q: "faq01Q", a: "faq01A" },
  { q: "faq02Q", a: "faq02A" },
  { q: "faq03Q", a: "faq03A" },
  { q: "faq04Q", a: "faq04A" },
  { q: "faq05Q", a: "faq05A" },
] as const;

export default async function ServicesPage() {
  const t = await getTranslations("Services.overview");

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
        <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("h1")}
        </h1>
        <p className="font-body text-muted-foreground max-w-xl text-lg">
          {t("subhead")}
        </p>
      </section>

      {/* Practices grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2">
          {PRACTICES.map(({ key, href, tags }) => (
            <Link key={key} href={href} className="group">
              <article className="bg-background group-hover:bg-surface-container group-focus-visible:bg-surface-container flex h-full flex-col gap-4 p-8 transition-colors">
                <h2 className="font-display text-foreground text-xl font-bold">
                  {t(`${key}Title`)}
                </h2>
                <p className="font-body text-muted-foreground grow text-sm leading-relaxed">
                  {t(`${key}Body`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-secondary-container font-mono text-xs">
                  {t(`${key}Title`)} →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="border-border border-y py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-body text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            {t("howWeWork")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("faqEyebrow")}
        </p>
        <h2 className="font-display text-foreground mb-12 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("faqHeadline")}
        </h2>
        <dl className="divide-border divide-y">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="py-6">
              <dt className="font-display text-foreground mb-2 text-base font-semibold">
                {t(q)}
              </dt>
              <dd className="font-body text-muted-foreground text-sm leading-relaxed">
                {t(a)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="font-display text-primary-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("ctaHeadline")}
          </h2>
          <p className="font-body text-primary-foreground/70 mb-8 text-lg">
            {t("ctaBody")}
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              {t("ctaButton")}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
