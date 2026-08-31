// Bookkeeping only — not imported; see registry-version.json for migration notes (BAN-135).
import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SiteFooterProps {
  columns?: FooterColumn[];
  logo?: React.ReactNode;
  legal?: string;
  className?: string;
}

const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(
  ({ columns, logo, legal, className }, ref) => {
    const year = new Date().getFullYear();

    return (
      <footer
        ref={ref}
        className={cn(
          "border-border bg-background w-full border-t px-6 py-12",
          className,
        )}
      >
        <div className="mx-auto w-full max-w-[1280px]">
          {columns && columns.length > 0 && (
            <div
              className={cn(
                "grid gap-8",
                "grid-cols-2 sm:grid-cols-3",
                columns.length >= 4 && "lg:grid-cols-4",
              )}
            >
              {columns.map((col, ci) => (
                <div key={ci}>
                  <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                    {col.title}
                  </p>
                  <ul className="mt-4 list-none space-y-3 p-0">
                    {col.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={link.href}
                          className="font-body text-foreground hover:text-accent text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <Separator className={cn(columns && columns.length > 0 && "my-8")} />

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            {logo && <div>{logo}</div>}
            <p className="text-muted-foreground font-mono text-xs">
              {legal ?? `© ${year} Bangicode. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  },
);
SiteFooter.displayName = "SiteFooter";

export { SiteFooter };
