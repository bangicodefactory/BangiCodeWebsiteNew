import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/portfolio";
import { SOLUTIONS } from "@/lib/solutions";
import { getPostSlugs } from "@/lib/blog";
import { BASE_URL } from "@/lib/json-ld";

const LOCALES = ["en", "fr", "ar"] as const;

type LangAlternates = MetadataRoute.Sitemap[number]["alternates"];

function alternates(path: string): LangAlternates {
  return {
    languages: {
      ...Object.fromEntries(
        LOCALES.map((locale) => [locale, `${BASE_URL}/${locale}${path}`]),
      ),
      "x-default": `${BASE_URL}/en${path}`,
    },
  };
}

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: alternates(path),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries = getProjectSlugs().map((slug) =>
    entry(`/portfolio/${slug}`, 0.6, "yearly"),
  );
  const solutionEntries = SOLUTIONS.map((s) =>
    entry(`/solutions/${s.slug}`, 0.6, "monthly"),
  );
  /*
   * Blog posts are enumerated per locale, but the sitemap models one entry with
   * three hreflang alternates. A post only present in `en` would advertise
   * /fr/blog/<slug> as an alternate that 404s, so only slugs published in EVERY
   * locale are listed. The others are reachable and indexable — just not
   * claimed here as trilingual.
   */
  const blogSlugs = getPostSlugs("en").filter(
    (slug) =>
      getPostSlugs("fr").includes(slug) && getPostSlugs("ar").includes(slug),
  );
  const blogEntries = blogSlugs.map((slug) =>
    entry(`/blog/${slug}`, 0.5, "yearly"),
  );

  return [
    entry("/", 1.0, "weekly"),
    entry("/about", 0.8, "monthly"),
    entry("/services", 0.9, "monthly"),
    entry("/services/software", 0.8, "monthly"),
    entry("/services/ecommerce", 0.8, "monthly"),
    entry("/services/training", 0.8, "monthly"),
    entry("/services/social", 0.8, "monthly"),
    entry("/solutions", 0.7, "monthly"),
    ...solutionEntries,
    entry("/portfolio", 0.7, "monthly"),
    ...projectEntries,
    entry("/blog", 0.6, "weekly"),
    ...blogEntries,
    entry("/process", 0.6, "monthly"),
    entry("/contact", 0.9, "monthly"),
    entry("/book", 0.8, "monthly"),
    entry("/careers", 0.5, "monthly"),
    entry("/legal/privacy", 0.3, "yearly"),
    entry("/legal/terms", 0.3, "yearly"),
    entry("/legal/cookies", 0.3, "yearly"),
  ];
}
