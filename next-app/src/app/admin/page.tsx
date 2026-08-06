import Link from "next/link";
import { FileText, FolderGit2 } from "lucide-react";
import { requireSession } from "@/lib/admin/require-session";
import { AdminShell } from "@/components/admin/AdminShell";
import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/portfolio";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { session, config } = await requireSession();

  const projects = getProjects();
  // A post is only "published" when all three locales exist — the locked rule.
  const postsByLocale = Object.fromEntries(
    routing.locales.map((l) => [l, getPosts(l).length]),
  );
  const completePosts = getPosts(routing.defaultLocale).filter((p) =>
    routing.locales.every((l) => getPosts(l).some((q) => q.slug === p.slug)),
  ).length;

  const cards = [
    {
      href: "/admin/blog",
      icon: FileText,
      label: "Blog posts",
      value: String(completePosts),
      detail:
        routing.locales.map((l) => `${l} ${postsByLocale[l]}`).join(" · ") ||
        undefined,
    },
    {
      href: "/admin/portfolio",
      icon: FolderGit2,
      label: "Projects",
      value: String(projects.length),
      detail: "all locales complete",
    },
  ];

  return (
    <AdminShell user={session} current="dashboard">
      <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
        Welcome back, {session.name.split(" ")[0]}.
      </h1>
      <p className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
        Publishing commits to{" "}
        <span className="font-mono text-xs">{config.githubRepo}</span> on{" "}
        <span className="font-mono text-xs">{config.githubBranch}</span>. The
        site rebuilds from that commit.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border-border bg-card hover:border-secondary focus-visible:ring-ring flex flex-col gap-3 rounded-md border p-6 shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <card.icon aria-hidden="true" className="text-accent size-5" />
            <span className="font-display text-foreground text-3xl font-bold tracking-tight">
              {card.value}
            </span>
            <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              {card.label}
            </span>
            {card.detail ? (
              <span className="text-muted-foreground font-mono text-xs">
                {card.detail}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
