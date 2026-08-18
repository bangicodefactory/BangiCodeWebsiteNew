"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Compiled once — strips /en|fr|ar prefix so /en/services → /services.
const LOCALE_PREFIX_RE = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

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
  onItemClick?: (item: NavLink) => void;
}

export function NavigationMenu({
  items,
  activeHref,
  dir,
  className,
  onItemClick,
}: NavigationMenuProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(LOCALE_PREFIX_RE, "/");

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
                  onClick={() => onItemClick?.(item)}
                  className={cn(
                    "font-body relative inline-flex items-center rounded-sm px-3 py-2",
                    "text-foreground text-sm font-medium transition-colors duration-200 ease-out",
                    "hover:bg-muted hover:text-foreground",
                    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    /*
                     * The underline is now on EVERY item, not only the active
                     * one — parked at scale-x-0 and grown from the centre on
                     * hover and focus.
                     *
                     * Before, the active item's bar simply existed and hover
                     * was a background fill, so pointing at a nav item told you
                     * nothing about the item you were pointing at; it just
                     * shaded a rectangle. Sharing one indicator between "where
                     * you are" and "where you would go" is what makes a nav bar
                     * feel connected to the pointer.
                     *
                     * scale-x rather than width: width is a layout property and
                     * would relayout the row on every hover. A transform on a
                     * pseudo-element stays on the compositor.
                     */
                    "after:absolute after:inset-x-3 after:bottom-0 after:content-['']",
                    "after:bg-secondary-container after:h-0.5 after:rounded-full",
                    "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 after:ease-out",
                    "hover:after:scale-x-100 focus-visible:after:scale-x-100",
                    /*
                     * Last, so tailwind-merge drops the scale-x-0 above rather
                     * than the other way round. Order in this array is the only
                     * thing deciding which one survives.
                     */
                    isActive && "after:scale-x-100",
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
