import { z } from "zod";
import { routing } from "@/i18n/routing";

/**
 * The portfolio content contract — schema, types and pure helpers.
 *
 * Split out of portfolio.ts because that module imports `node:fs`, and the
 * admin's ProjectEditor is a client component that needs the category list and
 * the Project type. Importing the loader from the browser bundle fails the
 * build outright (Turbopack cannot resolve `node:fs` for the client), so the
 * contract lives here where both sides can reach it and the filesystem access
 * stays server-only.
 */

export const PROJECT_CATEGORIES = [
  "software",
  "ecommerce",
  "web",
  "social",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

const localeContentSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  outcome: z.string().min(1),
});

const heroSchema = z.object({
  placeholder: z.boolean(),
  webp: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/**
 * Requires every configured locale to be present. Adding a locale to
 * routing.locales therefore fails every existing project file loudly at build
 * time, rather than silently rendering the slug to visitors of the new locale.
 */
const contentSchema = z.object(
  Object.fromEntries(
    routing.locales.map((l) => [l, localeContentSchema]),
  ) as Record<(typeof routing.locales)[number], typeof localeContentSchema>,
);

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  order: z.number().int().positive(),
  category: z.enum(PROJECT_CATEGORIES),
  tags: z.array(z.string().min(1)).min(1),
  date: z.string().min(1),
  hero: heroSchema,
  content: contentSchema,
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectLocaleContent = z.infer<typeof localeContentSchema>;

/** Shape handed to client components — no filesystem, no Zod, just data. */
export interface ProjectCardData {
  slug: string;
  category: ProjectCategory;
  tags: string[];
  date: string;
  name: string;
  summary: string;
}

export function toCardData(project: Project, locale: string): ProjectCardData {
  const fallback = routing.defaultLocale;
  const c =
    project.content[locale as keyof typeof project.content] ??
    project.content[fallback];
  return {
    slug: project.slug,
    category: project.category,
    tags: [...project.tags],
    date: project.date,
    name: c.name,
    summary: c.summary,
  };
}
