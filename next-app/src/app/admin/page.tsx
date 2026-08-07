import Link from "next/link";
import { FileText, FolderGit2, AlertTriangle } from "lucide-react";
import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  listBlogPosts,
  listProjectFiles,
  validProjects,
} from "@/lib/admin/content";
import { describeError } from "@/lib/admin/github";

export const dynamic = "force-dynamic";

/*
 * Reads from GitHub, like every other admin screen — NOT from the local
 * filesystem.
 *
 * This page previously used getPosts()/getProjects(), which read the `content/`
 * directory baked into the running build. Two problems with that:
 *
 *   1. Stale. Publish a post, land here, and the count is the build-time value
 *      while /admin/blog shows the live one. Two screens, two truths.
 *   2. Fragile. getProjects() throws on an invalid content file — correct for
 *      the build, wrong here. One malformed JSON file took out the admin's
 *      front door, exactly when you would want the admin to fix it.
 *
 * The GitHub-backed readers skip-and-surface instead of throwing, so a broken
 * file shows up as a lower count rather than a 500.
 */
export default async function AdminDashboard() {
  const { session, config } = await requireSession();

  const [posts, projects] = await Promise.all([
    listBlogPosts(config, config.githubToken),
    listProjectFiles(config, config.githubToken),
  ]);

  // A GitHub outage should degrade this page, not break it.
  const error = !posts.ok
    ? describeError(posts.error)
    : !projects.ok
      ? describeError(projects.error)
      : null;

  const livePosts = posts.ok ? posts.value.filter((p) => p.complete).length : 0;
  const draftPosts = posts.ok ? posts.value.length - livePosts : 0;

  // Same treatment as posts: a file that fails the schema is not a project, it
  // is a broken build waiting to happen, and the dashboard should say so rather
  // than counting it as live.
  const liveProjects = projects.ok ? validProjects(projects.value).length : 0;
  const brokenProjects = projects.ok ? projects.value.length - liveProjects : 0;

  const cards = [
    {
      href: "/admin/blog",
      icon: FileText,
      label: "Blog posts",
      value: posts.ok ? String(livePosts) : "—",
      detail:
        draftPosts > 0
          ? `${draftPosts} incomplete — not live`
          : "all locales complete",
    },
    {
      href: "/admin/portfolio",
      icon: FolderGit2,
      label: "Projects",
      value: projects.ok ? String(liveProjects) : "—",
      detail:
        brokenProjects > 0
          ? `${brokenProjects} need fixing — blocking the build`
          : "all locales complete",
    },
  ];

  return (
    <AdminShell user={toAdminUser(session)} current="dashboard">
      <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
        Welcome back, {session.name.split(" ")[0]}.
      </h1>
      <p className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
        Publishing commits to{" "}
        <span className="font-mono text-xs">{config.githubRepo}</span> on{" "}
        <span className="font-mono text-xs">{config.githubBranch}</span>. The
        site rebuilds from that commit.
      </p>

      {error ? (
        <p
          role="alert"
          className="border-destructive bg-card text-foreground font-body mt-6 flex items-start gap-3 rounded-sm border-s-2 p-4 text-sm leading-relaxed"
        >
          <AlertTriangle
            aria-hidden="true"
            className="text-destructive mt-0.5 size-4 shrink-0"
          />
          {error}
        </p>
      ) : null}

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
            <span className="text-muted-foreground font-mono text-xs">
              {card.detail}
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
