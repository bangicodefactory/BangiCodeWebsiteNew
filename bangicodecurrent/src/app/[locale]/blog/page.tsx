import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { getPosts } from "@/lib/blog";

/*
 * Rendered on demand, not at build. See ADR 0003.
 *
 * This page reads posts from the database, and the BUILD has no database — CI
 * failed here with "Database is not configured" the first time it ran without
 * one. The detail routes avoid it by returning [] from generateStaticParams,
 * but an index page has no dynamic params to withhold, so it needs saying
 * outright.
 *
 * Costs less than it looks: the query itself is cached under the `posts` tag
 * and invalidated on publish, so a request renders markup from cached data
 * rather than hitting MySQL.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("h1"),
    description: t("subhead"),
    alternates: buildAlternates("/blog", locale),
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Blog");
  const posts = await getPosts(locale);

  return (
    <div>
      <section className="max-w-content mx-auto px-4 pt-24 pb-12 sm:px-6 sm:pt-32">
        <p className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("h1")}
        </h1>
        <p className="font-body text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {t("subhead")}
        </p>
      </section>

      <section className="max-w-content mx-auto px-4 pb-24 sm:px-6">
        {posts.length === 0 ? (
          /*
           * Honest empty state. No placeholder posts: fabricating articles the
           * studio never wrote would be worse than an empty list, and the index
           * starts working the moment a real .mdx file is added.
           */
          <div className="border-border bg-card max-w-2xl rounded-md border p-8">
            <p className="font-body text-muted-foreground text-base leading-relaxed">
              {t("empty")}
            </p>
            <p className="text-muted-foreground mt-4 font-mono text-xs">
              {t("emptyCtaPrefix")}{" "}
              <Link
                href="/portfolio"
                className="text-accent focus-visible:ring-ring rounded-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
              >
                {t("emptyCtaLink")}
              </Link>
            </p>
          </div>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group border-border bg-card hover:border-secondary focus-visible:ring-ring transition-interactive flex h-full flex-col gap-3 rounded-md border p-6 shadow-xs duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
                >
                  {post.date && (
                    <time
                      dateTime={post.date}
                      dir="ltr"
                      className="text-muted-foreground font-mono text-xs tabular-nums"
                    >
                      {post.date.slice(0, 10)}
                    </time>
                  )}
                  <h2 className="font-display text-foreground text-lg font-bold tracking-tight">
                    {post.title}
                  </h2>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {post.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
