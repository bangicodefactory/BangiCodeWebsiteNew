import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { listProjectFiles } from "@/lib/admin/content";
import { attempt } from "@/lib/admin/attempt";
import { routing } from "@/i18n/routing";
import type { Project } from "@/lib/portfolio-schema";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { session } = await requireSession();

  // Default to the end of the list rather than colliding with an existing
  // position — order is a plain number, and two projects sharing one sorts
  // unpredictably. A rejected file still occupies its position, so max() reads
  // every entry's order, not just the valid ones.
  const existing = await attempt(() => listProjectFiles());
  const nextOrder = existing.ok
    ? existing.value.reduce((max, e) => Math.max(max, e.order ?? 0), 0) + 1
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
    <AdminShell user={toAdminUser(session)} current="portfolio">
      <ProjectEditor project={empty} isNew />
    </AdminShell>
  );
}
