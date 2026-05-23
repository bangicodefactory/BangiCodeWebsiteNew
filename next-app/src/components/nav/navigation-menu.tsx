"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

interface NavigationMenuProps {
  items: NavLink[];
  /** Overrides pathname-based active detection. Useful for demos and SSR pre-render. */
  activeHref?: string;
  dir?: "ltr" | "rtl";
  className?: string;
}

export function NavigationMenu({
  items,
  activeHref,
  dir,
  className,
}: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <NavigationMenuPrimitive.Root
      dir={dir}
      className={cn("relative flex", className)}
    >
      <NavigationMenuPrimitive.List className="m-0 flex list-none items-center gap-1 p-0">
        {items.map((item) => {
          const isActive =
            activeHref !== undefined
              ? activeHref === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <NavigationMenuPrimitive.Item key={item.href}>
              <NavigationMenuPrimitive.Link asChild active={isActive}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "font-hanken-grotesk relative inline-flex items-center rounded-sm px-3 py-2",
                    "text-foreground text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    // Active: 2px sky-blue underline per DESIGN.md §Components active state
                    isActive && [
                      "after:absolute after:inset-x-3 after:bottom-0",
                      "after:bg-secondary-container after:h-0.5 after:rounded-full",
                      "after:content-['']",
                    ],
                  )}
                >
                  {item.label}
                </Link>
              </NavigationMenuPrimitive.Link>
            </NavigationMenuPrimitive.Item>
          );
        })}
      </NavigationMenuPrimitive.List>
    </NavigationMenuPrimitive.Root>
  );
}
