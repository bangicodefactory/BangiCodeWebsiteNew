import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdminUser } from "@/lib/admin/session";

/**
 * Chrome shared by every signed-in admin screen.
 *
 * Built on the same tokens as the public site (src/styles/tokens.css) and, like
 * the public nav, uses `data-surface="dark"` for the bar rather than hand-picked
 * navy classes — so the children inside it resolve their colours from the same
 * semantic layer without knowing they are on a dark band.
 */
export function AdminShell({
  user,
  current,
  children,
}: {
  /*
   * AdminUser, not AdminSession. Passing the whole session let extra fields
   * ride along on structural typing — harmless while this is a server
   * component, and a leak the moment anyone adds "use client".
   */
  user: AdminUser;
  current: "dashboard" | "blog" | "portfolio";
  children: ReactNode;
}) {
  const tabs = [
    { id: "dashboard", label: "Overview", href: "/admin" },
    { id: "blog", label: "Blog", href: "/admin/blog" },
    { id: "portfolio", label: "Projects", href: "/admin/portfolio" },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <header
        data-surface="dark"
        className="bg-background border-border sticky top-0 z-40 border-b"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              aria-label="Bangicode CMS — overview"
              className="focus-visible:ring-ring rounded-sm bg-white px-2 py-1 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Image
                src="/brand/logo.svg"
                alt="Bangicode"
                width={120}
                height={19}
                priority
                className="h-[19px] w-auto"
              />
            </Link>
            <span className="text-muted-foreground hidden font-mono text-xs tracking-widest uppercase sm:inline">
              {"// cms"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden font-mono text-xs sm:inline">
              {user.name}
            </span>
            {/*
             * Initials, not the GitHub avatar. Rendering the avatar would mean
             * either an <img> that fails the no-img-element rule, or opening a
             * next/image remote pattern to avatars.githubusercontent.com — a
             * config change and an outbound request per page load, for 28px of
             * decoration. The initial circle is already the site's idiom
             * (TestimonialsSection, FounderCard) and needs neither.
             */}
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            >
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            {/* POST, not a link — see admin/auth/logout/route.ts */}
            <form action="/admin/auth/logout" method="post">
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm font-mono text-xs underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="CMS sections"
          className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={current === tab.id ? "page" : undefined}
              className={`focus-visible:ring-ring -mb-px border-b-2 px-3 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                current === tab.id
                  ? "border-spark text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
      >
        {children}
      </main>

      <footer className="border-border mx-auto w-full max-w-6xl border-t px-4 py-6 sm:px-6">
        <p className="text-muted-foreground font-mono text-xs">
          Changes are committed to the repository and go live on the next build.
        </p>
      </footer>
    </div>
  );
}
