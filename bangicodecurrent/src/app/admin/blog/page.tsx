import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/admin/require-session";
import { toAdminUser } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { listBlogPosts } from "@/lib/admin/content";
import { attempt } from "@/lib/admin/attempt";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminBlogList({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { session } = await requireSession();
  const { deleted } = await searchParams;
  const result = await attempt(() => listBlogPosts());

  return (
    <AdminShell user={toAdminUser(session)} current="blog">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
            Blog posts
          </h1>
          <p className="font-body text-muted-foreground mt-2 text-sm">
            Each post needs all three languages before it appears on the site.
          </p>
        </div>
        <Button asChild variant="spark">
          <Link href="/admin/blog/new">
            <Plus aria-hidden="true" className="size-4" />
            New post
          </Link>
        </Button>
      </div>

      {deleted ? (
        <p
          role="status"
          className="border-success bg-card text-foreground font-body mt-6 rounded-sm border-s-2 p-4 text-sm"
        >
          Deleted “{deleted}”. It is gone from the site already.
        </p>
      ) : null}

      {!result.ok ? (
        <p
          role="alert"
          className="border-destructive bg-card text-foreground font-body mt-8 rounded-sm border-s-2 p-4 text-sm leading-relaxed"
        >
          {result.error}
        </p>
      ) : result.value.length === 0 ? (
        <div className="border-border bg-card mt-8 rounded-md border p-8">
          <p className="font-body text-muted-foreground text-sm leading-relaxed">
            No posts yet. The blog index shows an honest empty state until the
            first one is published.
          </p>
        </div>
      ) : (
        <ul className="mt-8 list-none space-y-3 p-0">
          {result.value.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/admin/blog/${post.slug}`}
                className="group border-border bg-card hover:border-secondary focus-visible:ring-ring flex flex-wrap items-center justify-between gap-4 rounded-md border p-5 transition-[border-color] focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-base font-semibold">
                    {post.title}
                  </p>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    {post.slug}
                    {post.date ? ` · ${post.date}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {routing.locales.map((locale) => {
                    const present = post.locales.includes(locale);
                    return (
                      <span
                        key={locale}
                        title={
                          present
                            ? `${locale} written`
                            : `${locale} missing — post is not live`
                        }
                        className={`rounded-full px-2 py-0.5 font-mono text-xs uppercase ${
                          present
                            ? "bg-secondary/15 text-accent"
                            : "bg-muted text-muted-foreground line-through"
                        }`}
                      >
                        {locale}
                      </span>
                    );
                  })}
                  {!post.complete ? (
                    <span className="bg-error-container text-on-error-container rounded-full px-2 py-0.5 font-mono text-xs">
                      not live
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
