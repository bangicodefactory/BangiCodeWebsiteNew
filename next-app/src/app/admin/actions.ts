"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import { projectSchema } from "@/lib/portfolio-schema";
import { requireSession } from "@/lib/admin/require-session";
import { duplicateKeyName, isDuplicateKeyError } from "@/lib/db";
import { POSTS_TAG } from "@/lib/blog";
import { PROJECTS_TAG } from "@/lib/portfolio";
import {
  blogPostSchema,
  commitAuthor,
  deleteBlogPost,
  deleteProject,
  getBlogPost,
  listProjectFiles,
  saveBlogPost,
  saveProject,
  slugSchema,
} from "@/lib/admin/content";

/**
 * Mutations for the CMS. See ADR 0003.
 *
 * Every action calls requireSession() FIRST. Server actions are POST endpoints
 * reachable directly with a crafted request — the middleware guard protects
 * page navigations, not these. An action that trusted the middleware would be
 * an unauthenticated write endpoint.
 *
 * Validation is Zod, against the SAME schemas the public site reads with, so a
 * row that would fail to render is rejected before it is written.
 *
 * Every successful write invalidates its cache tag. The public routes are
 * cached indefinitely and revalidated by tag rather than by time, so WITHOUT
 * these calls a publish would appear to succeed and change nothing a visitor
 * can see — the most confusing failure this design can have.
 */

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; message: string };

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

/**
 * Turns a write failure into something an author can act on.
 *
 * A duplicate-key error is not a server fault — it means someone published the
 * same slug or position while this form was open — so it is reported as a
 * field error rather than a stack trace. Everything else is genuinely
 * unexpected and says so without leaking the query.
 */
function describeWriteError(error: unknown): ActionState {
  if (isDuplicateKeyError(error)) {
    const key = duplicateKeyName(error) ?? "";
    if (key.includes("sort_order")) {
      return {
        status: "error",
        message:
          "That position is already taken by another project. Reload to see the current order, then pick another.",
        fieldErrors: { order: "Already in use" },
      };
    }
    return {
      status: "error",
      message: "That slug is already in use.",
      fieldErrors: { slug: "Already in use" },
    };
  }
  const message =
    error instanceof Error ? error.message : "The write did not complete.";
  return { status: "error", message };
}

/** Makes a publish visible. See the note at the top of this file. */
function publishedBlog(slug: string) {
  // Next 16 requires a cache profile; "max" is the documented equivalent of
  // the old single-argument call — purge, do not merely shorten the life.
  revalidateTag(POSTS_TAG, "max");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}/blog/${slug}`);
  }
  // The sitemap enumerates posts, so it is stale too.
  revalidatePath("/sitemap.xml");
}

function publishedProject(slug: string) {
  revalidateTag(PROJECTS_TAG, "max");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/portfolio`);
    revalidatePath(`/${locale}/portfolio/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}

/* ── Blog ──────────────────────────────────────────────────────────────── */

export async function saveBlogPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireSession();

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
  // The UNIQUE index is the real guarantee — this is the friendly message.
  if (isNew && (await getBlogPost(parsed.data.slug))) {
    return {
      status: "error",
      message: `A post with the slug "${parsed.data.slug}" already exists.`,
      fieldErrors: { slug: "Already in use" },
    };
  }

  try {
    await saveBlogPost(parsed.data, commitAuthor(session), isNew);
  } catch (error) {
    return describeWriteError(error);
  }

  publishedBlog(parsed.data.slug);

  return {
    status: "success",
    message: isNew ? "Post created." : "Post updated.",
  };
}

export async function deleteBlogPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireSession();

  const slug = slugSchema.safeParse(str(form, "slug"));
  if (!slug.success) return { status: "error", message: "Invalid slug." };

  // Typing the slug to confirm — a misfired click should not delete a post.
  if (str(form, "confirm") !== slug.data) {
    return {
      status: "error",
      message: "Type the slug exactly to confirm deletion.",
    };
  }

  try {
    await deleteBlogPost(slug.data, commitAuthor(session));
  } catch (error) {
    return describeWriteError(error);
  }

  publishedBlog(slug.data);
  redirect("/admin/blog?deleted=" + encodeURIComponent(slug.data));
}

/* ── Portfolio ─────────────────────────────────────────────────────────── */

export async function saveProjectAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireSession();

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
   * built by interpolation, and deriving from unvalidated input is the
   * ordering that turns into a bug the next time someone adds a field.
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

  /*
   * Two cross-row checks Zod cannot make, because it validates ONE project and
   * neither of these is a property of one project.
   *
   * Both are ALSO enforced by UNIQUE indexes, which is the real guarantee — a
   * check-then-write always leaves a window between the two. These exist to
   * name the offender: "already used by rentcar" is actionable, ER_DUP_ENTRY
   * is not. describeWriteError catches whatever slips through the window.
   */
  const existing = await listProjectFiles();

  if (isNew && existing.some((e) => e.slug === parsed.data.slug)) {
    return {
      status: "error",
      message: `A project with the slug "${parsed.data.slug}" already exists.`,
      fieldErrors: { slug: "Already in use" },
    };
  }

  const clash = existing.find(
    (e) => e.slug !== parsed.data.slug && e.order === parsed.data.order,
  );
  if (clash) {
    return {
      status: "error",
      message: `Order ${parsed.data.order} is already used by "${clash.slug}". Every project needs a distinct position, or the portfolio reorders itself between builds.`,
      fieldErrors: { order: `Already used by "${clash.slug}"` },
    };
  }

  try {
    await saveProject(parsed.data, commitAuthor(session), isNew);
  } catch (error) {
    return describeWriteError(error);
  }

  publishedProject(parsed.data.slug);

  return {
    status: "success",
    message: isNew ? "Project created." : "Project updated.",
  };
}

export async function deleteProjectAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireSession();

  const slug = slugSchema.safeParse(str(form, "slug"));
  if (!slug.success) return { status: "error", message: "Invalid slug." };

  if (str(form, "confirm") !== slug.data) {
    return {
      status: "error",
      message: "Type the slug exactly to confirm deletion.",
    };
  }

  try {
    await deleteProject(slug.data, commitAuthor(session));
  } catch (error) {
    return describeWriteError(error);
  }

  publishedProject(slug.data);
  redirect("/admin/portfolio?deleted=" + encodeURIComponent(slug.data));
}
