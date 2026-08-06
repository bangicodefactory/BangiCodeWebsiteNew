import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { today } from "@/lib/admin/content";
import { routing } from "@/i18n/routing";
import type { BlogPostInput } from "@/lib/admin/content";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const { session } = await requireSession();

  const empty: BlogPostInput = {
    slug: "",
    date: today(),
    content: Object.fromEntries(
      routing.locales.map((l) => [l, { title: "", description: "", body: "" }]),
    ) as BlogPostInput["content"],
  };

  return (
    <AdminShell user={toAdminUser(session)} current="blog">
      <BlogEditor post={empty} isNew />
    </AdminShell>
  );
}
