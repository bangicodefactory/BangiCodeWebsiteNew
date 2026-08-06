import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/require-session";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getProjectFile, slugSchema } from "@/lib/admin/content";
import { describeError } from "@/lib/admin/github";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { session, config } = await requireSession();
  const { slug } = await params;

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) notFound();

  const result = await getProjectFile(
    config,
    session.accessToken,
    parsedSlug.data,
  );
  if (!result.ok) {
    return (
      <AdminShell user={session} current="portfolio">
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

  return (
    <AdminShell user={session} current="portfolio">
      <ProjectEditor project={result.value} isNew={false} />
    </AdminShell>
  );
}
