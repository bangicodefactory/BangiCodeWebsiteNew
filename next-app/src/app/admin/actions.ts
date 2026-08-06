"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import { projectSchema } from "@/lib/portfolio-schema";
import { requireSession } from "@/lib/admin/require-session";
import {
  blogPostSchema,
  commitAuthor,
  deleteBlogPost,
  deleteProject,
  getBlogPost,
  saveBlogPost,
  saveProject,
  slugSchema,
} from "@/lib/admin/content";
import { describeError } from "@/lib/admin/github";

/**
 * Mutations for the CMS.
 *
 * Every action calls requireSession() FIRST. Server actions are POST endpoints
 * reachable directly with a crafted request — the middleware guard protects
 * page navigations, not these. An action that trusted the middleware would be
 * an unauthenticated write endpoint.
 *
 * Validation is Zod, against the SAME schemas the site's content loader uses.
 * That is what makes a bad write impossible rather than merely unlikely: content
 * that would fail the build is rejected here, before it can reach the repo.
 */

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; message: string; commitUrl?: string };

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    // First message per field wins — the rest are usually consequences.
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/* ── Blog ──────────────────────────────────────────────────────────────── */

export async function saveBlogPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, config } = await requireSession();

  const isNew = str(form, "isNew") === "true";
  const content = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      {
        title: str(form, `title.${locale}`),
        description: str(form, `description.${locale}`),
        body: String(form.get(`body.${locale}`) ?? "").trim(),
      },
    ]),
  );

  const parsed = blogPostSchema.safeParse({
    slug: str(form, "slug"),
    date: str(form, "date"),
    content,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Some fields need attention. Every locale must be complete before publishing.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  // Refuse to silently overwrite an existing post when creating a new one.
  if (isNew) {
    const existing = await getBlogPost(
      config,
      config.githubToken,
      parsed.data.slug,
    );
    if (!existing.ok) {
      return { status: "error", message: describeError(existing.error) };
    }
    if (existing.value) {
      return {
        status: "error",
        message: `A post with the slug "${parsed.data.slug}" already exists.`,
        fieldErrors: { slug: "Already in use" },
      };
    }
  }

  const result = await saveBlogPost(
    config,
    config.githubToken,
    parsed.data,
    commitAuthor(session),
    isNew,
  );
  if (!result.ok) {
    return { status: "error", message: describeError(result.error) };
  }

  return {
    status: "success",
    message: isNew ? "Post created." : "Post updated.",
    commitUrl: result.value.url,
  };
}

export async function deleteBlogPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, config } = await requireSession();

  const slug = slugSchema.safeParse(str(form, "slug"));
  if (!slug.success) return { status: "error", message: "Invalid slug." };

  // Typing the slug to confirm — a misfired click should not delete a post.
  if (str(form, "confirm") !== slug.data) {
    return {
      status: "error",
      message: "Type the slug exactly to confirm deletion.",
    };
  }

  const existing = await getBlogPost(config, config.githubToken, slug.data);
  if (!existing.ok) {
    return { status: "error", message: describeError(existing.error) };
  }
  if (!existing.value) {
    return { status: "error", message: "That post no longer exists." };
  }

  const locales = str(form, "locales")
    .split(",")
    .map((l) => l.trim())
    .filter((l): l is Locale =>
      (routing.locales as readonly string[]).includes(l),
    );

  const result = await deleteBlogPost(
    config,
    config.githubToken,
    slug.data,
    locales.length > 0 ? locales : [...routing.locales],
    commitAuthor(session),
  );
  if (!result.ok) {
    return { status: "error", message: describeError(result.error) };
  }

  redirect("/admin/blog?deleted=" + encodeURIComponent(slug.data));
}

/* ── Portfolio ─────────────────────────────────────────────────────────── */

export async function saveProjectAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, config } = await requireSession();

  const isNew = str(form, "isNew") === "true";
  const content = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      {
        name: str(form, `name.${locale}`),
        summary: str(form, `summary.${locale}`),
        outcome: str(form, `outcome.${locale}`),
      },
    ]),
  );

  /*
   * Validate the slug BEFORE anything is derived from it. The hero path is
   * built by interpolation, and while projectSchema would reject a traversal
   * attempt a moment later, deriving from unvalidated input is the ordering
   * that turns into a path-traversal bug the next time someone adds a field.
   */
  const slugResult = slugSchema.safeParse(str(form, "slug"));
  if (!slugResult.success) {
    return {
      status: "error",
      message: "Some fields need attention.",
      fieldErrors: {
        slug: slugResult.error.issues[0]?.message ?? "Invalid slug",
      },
    };
  }
  const slug = slugResult.data;
  const tags = str(form, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const parsed = projectSchema.safeParse({
    slug,
    order: Number(str(form, "order")) || 0,
    category: str(form, "category"),
    tags,
    date: str(form, "date"),
    hero: {
      // Heroes are placeholders until real screenshots exist; the path is
      // derived rather than typed so it cannot drift from the slug.
      placeholder: true,
      webp: `/case-studies/${slug}/hero.webp`,
      alt: str(form, "heroAlt") || content[routing.defaultLocale]?.name || slug,
      width: 1600,
      height: 900,
    },
    content,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Some fields need attention. Every locale must be complete before publishing.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const result = await saveProject(
    config,
    config.githubToken,
    parsed.data,
    commitAuthor(session),
    isNew,
  );
  if (!result.ok) {
    return { status: "error", message: describeError(result.error) };
  }

  return {
    status: "success",
    message: isNew ? "Project created." : "Project updated.",
    commitUrl: result.value.url,
  };
}

export async function deleteProjectAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, config } = await requireSession();

  const slug = slugSchema.safeParse(str(form, "slug"));
  if (!slug.success) return { status: "error", message: "Invalid slug." };

  if (str(form, "confirm") !== slug.data) {
    return {
      status: "error",
      message: "Type the slug exactly to confirm deletion.",
    };
  }

  const result = await deleteProject(
    config,
    config.githubToken,
    slug.data,
    commitAuthor(session),
  );
  if (!result.ok) {
    return { status: "error", message: describeError(result.error) };
  }

  redirect("/admin/portfolio?deleted=" + encodeURIComponent(slug.data));
}
