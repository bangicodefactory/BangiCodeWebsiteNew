import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { getPost, getPostSlugs } from "@/lib/blog";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPostSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: buildAlternates(`/blog/${slug}`, locale),
  };
}

/*
 * Renders an MDX post body via next-mdx-remote's RSC entrypoint, so no MDX
 * runtime reaches the client bundle.
 *
 * generateStaticParams returns [] until the first post exists; with Next's
 * default dynamicParams this route simply 404s in the meantime, which is the
 * correct answer for a slug that was never published.
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("Blog");

  return (
    <div>
      <div className="max-w-content mx-auto px-4 pt-8 sm:px-6">
        <Link
          href="/blog"
          className="text-muted-foreground focus-visible:ring-ring hover:text-foreground rounded-sm font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {locale === "ar" ? "→" : "←"} {t("backToBlog")}
        </Link>
      </div>

      <article className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6">
        <header className="mb-10">
          {post.date && (
            <p className="text-muted-foreground mb-4 font-mono text-xs">
              {t("publishedLabel")}{" "}
              <time dateTime={post.date} dir="ltr" className="tabular-nums">
                {post.date.slice(0, 10)}
              </time>
            </p>
          )}
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="font-body text-muted-foreground mt-5 text-lg leading-relaxed">
              {post.description}
            </p>
          )}
        </header>

        <div className="prose prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground prose-p:font-body prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-accent prose-code:font-mono prose-code:text-foreground max-w-none">
          <MDXRemote source={post.body} />
        </div>
      </article>
    </div>
  );
}
