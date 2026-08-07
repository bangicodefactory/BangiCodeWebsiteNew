import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { listProjectFiles } from "@/lib/admin/content";
import { describeError } from "@/lib/admin/github";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioList({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { session, config } = await requireSession();
  const { deleted } = await searchParams;
  const result = await listProjectFiles(config, config.githubToken);

  return (
    <AdminShell user={toAdminUser(session)} current="portfolio">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
            Projects
          </h1>
          <p className="font-body text-muted-foreground mt-2 text-sm">
            One file per project, all three languages in each.
          </p>
        </div>
        <Button asChild variant="spark">
          <Link href="/admin/portfolio/new">
            <Plus aria-hidden="true" className="size-4" />
            New project
          </Link>
        </Button>
      </div>

      {deleted ? (
        <p
          role="status"
          className="border-success bg-card text-foreground font-body mt-6 rounded-sm border-s-2 p-4 text-sm"
        >
          Deleted &ldquo;{deleted}&rdquo;. The removal is committed; the site
          drops it on the next build.
        </p>
      ) : null}

      {!result.ok ? (
        <p
          role="alert"
          className="border-destructive bg-card text-foreground font-body mt-8 rounded-sm border-s-2 p-4 text-sm leading-relaxed"
        >
          {describeError(result.error)}
        </p>
      ) : (
        <ul className="mt-8 list-none space-y-3 p-0">
          {result.value.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/admin/portfolio/${entry.slug}`}
                className={`group bg-card focus-visible:ring-ring flex flex-wrap items-center justify-between gap-4 rounded-md border p-5 transition-[border-color] focus-visible:ring-2 focus-visible:outline-none ${
                  entry.project
                    ? "border-border hover:border-secondary"
                    : "border-destructive"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-base font-semibold">
                    {entry.project ? entry.project.content.en.name : entry.slug}
                  </p>
                  {/*
                   * A file that fails the schema is shown here rather than
                   * hidden. It is already blocking the site build, and this
                   * list is where someone would come to fix it — silently
                   * omitting it means the CMS says everything is fine while
                   * the deploy fails.
                   */}
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    {entry.project ? (
                      <>
                        {entry.slug} · {entry.project.date}
                      </>
                    ) : (
                      <span className="text-destructive">
                        {entry.slug}.json — {entry.problem ?? "invalid"}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.order !== null ? (
                    <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-mono text-xs">
                      #{entry.order}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                      entry.project
                        ? "bg-secondary/15 text-accent"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    {entry.project ? entry.project.category : "needs fixing"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
