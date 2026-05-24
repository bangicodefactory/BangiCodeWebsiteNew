import type { MetadataRoute } from "next";
import { PROJECTS } from "./[locale]/work/projects";
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
  const projectEntries = PROJECTS.map((p) =>
    entry(`/work/${p.slug}`, 0.6, "yearly"),
  );

  return [
    entry("/", 1.0, "weekly"),
    entry("/about", 0.8, "monthly"),
    entry("/services", 0.9, "monthly"),
    entry("/services/software", 0.8, "monthly"),
    entry("/services/ecommerce", 0.8, "monthly"),
    entry("/services/training", 0.8, "monthly"),
    entry("/services/social", 0.8, "monthly"),
    entry("/work", 0.7, "monthly"),
    ...projectEntries,
    entry("/process", 0.6, "monthly"),
    entry("/contact", 0.9, "monthly"),
    entry("/book", 0.8, "monthly"),
    entry("/careers", 0.5, "monthly"),
    entry("/legal/privacy", 0.3, "yearly"),
    entry("/legal/terms", 0.3, "yearly"),
    entry("/legal/cookies", 0.3, "yearly"),
  ];
}
