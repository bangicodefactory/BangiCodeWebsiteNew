import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import fs from "fs/promises";
import path from "path";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return {
    title: t("privacyTitle"),
    description: t("privacyMetaDescription"),
  };
}

async function getPrivacyContent(locale: string) {
  const filepath = path.join(
    process.cwd(),
    "content",
    "legal",
    "privacy",
    locale,
    "v1.mdx",
  );
  try {
    const raw = await fs.readFile(filepath, "utf8");
    const { content, data } = matter(raw);
    return { content, frontmatter: data };
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const result = await getPrivacyContent(locale);
  if (!result) notFound();

  const t = await getTranslations({ locale, namespace: "Legal" });
  const { content, frontmatter } = result;

  const lastUpdated = frontmatter.lastUpdated as string | undefined;

  return (
    <main id="main-content">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-32">
        {/* Header */}
        <div className="mb-12">
          <p
            dir="ltr"
            className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
          >
            {t("legalEyebrow")}
          </p>
          <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("privacyTitle")}
          </h1>
          {lastUpdated && (
            <p
              dir="ltr"
              className="text-muted-foreground font-mono text-xs tabular-nums"
            >
              {t("lastUpdatedLabel")}:{" "}
              {new Date(lastUpdated).toLocaleDateString(
                locale === "ar" ? "fr-MA" : locale === "fr" ? "fr-FR" : "en-GB",
                { year: "numeric", month: "long" },
              )}
            </p>
          )}
        </div>

        {/* MDX content */}
        <div className="prose prose-slate max-w-none">
          <MDXRemote source={content} options={{ parseFrontmatter: false }} />
        </div>

        {/* Back to legal / footer nav */}
        <div className="border-border mt-16 border-t pt-8">
          <p className="text-muted-foreground font-mono text-xs">
            <Link
              href="/"
              className="focus-visible:ring-ring hover:text-foreground rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              ← {t("backToHome")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
