import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { getBlogPost, slugSchema } from "@/lib/admin/content";
import { describeError } from "@/lib/admin/github";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { session, config } = await requireSession();
  const { slug } = await params;

  // Validate before the slug reaches a repository path.
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) notFound();

  const result = await getBlogPost(config, config.githubToken, parsedSlug.data);
  if (!result.ok) {
    return (
      <AdminShell user={toAdminUser(session)} current="blog">
        <p
          role="alert"
          className="border-destructive bg-card text-foreground font-body rounded-sm border-s-2 p-4 text-sm leading-relaxed"
        >
          {describeError(result.error)}
        </p>
      </AdminShell>
    );
  }
  if (!result.value) notFound();

  // Which locales actually have a file — the delete commit only touches those.
  const existingLocales = routing.locales.filter(
    (l) => result.value!.content[l].title !== "",
  );

  return (
    <AdminShell user={toAdminUser(session)} current="blog">
      <BlogEditor
        post={result.value}
        isNew={false}
        existingLocales={existingLocales}
      />
    </AdminShell>
  );
}
