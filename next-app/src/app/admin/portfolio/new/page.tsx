import { requireSession } from "@/lib/admin/require-session";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { listProjectFiles } from "@/lib/admin/content";
import { routing } from "@/i18n/routing";
import type { Project } from "@/lib/portfolio-schema";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { session, config } = await requireSession();

  // Default to the end of the list rather than colliding with an existing
  // position — order is a plain number, and two projects sharing one sorts
  // unpredictably.
  const existing = await listProjectFiles(config, session.accessToken);
  const nextOrder = existing.ok
    ? existing.value.reduce((max, p) => Math.max(max, p.order), 0) + 1
    : 1;

  const empty: Project = {
    slug: "",
    order: nextOrder,
    category: "software",
    tags: [],
    date: "",
    hero: {
      placeholder: true,
      webp: "",
      alt: "",
      width: 1600,
      height: 900,
    },
    content: Object.fromEntries(
      routing.locales.map((l) => [l, { name: "", summary: "", outcome: "" }]),
    ) as Project["content"],
  };

  return (
    <AdminShell user={session} current="portfolio">
      <ProjectEditor project={empty} isNew />
    </AdminShell>
  );
}
