"use client";

import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { NavigationMenu, type NavLink } from "@/components/nav/navigation-menu";
import { SmokeVersionStrip } from "@/components/smoke/smoke-version-strip";

const NAV_ITEMS: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
];

export default function SmokeSheetPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 font-mono">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <Link
          href="/smoke"
          className="mb-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft className="size-3" />
          Back to gallery
        </Link>
        <p className="mb-2 text-xs tracking-widest text-blue-600 uppercase">
          {"// _smoke / sheet + navigation-menu"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          @bangicode/sheet · local NavigationMenu
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Sheet (registry) · NavigationMenu (local, Radix-based)
        </p>
        <SmokeVersionStrip name="sheet" />
      </header>

      <section className="mb-10">
        <div className="space-y-1 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            <strong>Tokens pending (IST-120):</strong>{" "}
            <code className="rounded bg-amber-100 px-1">bg-popover</code>,{" "}
            <code className="rounded bg-amber-100 px-1">bg-scrim</code>,{" "}
            <code className="rounded bg-amber-100 px-1">
              bg-secondary-container
            </code>{" "}
            resolve to browser defaults until the registry{" "}
            <code className="rounded bg-amber-100 px-1">@theme</code> is wired.
            Active underline and overlay tint are invisible until then.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          NavigationMenu — desktop
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Tab / Shift+Tab to move between items. Arrow keys also supported by
          Radix. Active item shows 2px{" "}
          <code className="rounded bg-gray-100 px-1">secondary-container</code>{" "}
          underline and{" "}
          <code className="rounded bg-gray-100 px-1">
            aria-current=&quot;page&quot;
          </code>
          .
        </p>

        <div className="rounded border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">Bangicode</span>
            <NavigationMenu items={NAV_ITEMS} />
            <Button variant="primary" size="sm">
              Start a project
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-6">
          <p className="mb-2 text-xs font-semibold text-gray-400">
            Simulated active state — Services
          </p>
          <NavigationMenu items={NAV_ITEMS} activeHref="/services" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          NavigationMenu — RTL
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Menu items flow right-to-left. Dropdown alignment (when added in
          BAN-134) will flip via logical properties automatically.
        </p>
        <div
          dir="rtl"
          className="rounded border border-dashed border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <Button variant="primary" size="sm">
              ابدأ مشروعًا
            </Button>
            <NavigationMenu
              dir="rtl"
              activeHref="/services"
              items={[
                { label: "الخدمات", href: "/services" },
                { label: "المحفظة", href: "/portfolio" },
                { label: "العملية", href: "/process" },
                { label: "عنّا", href: "/about" },
              ]}
            />
            <span className="font-mono text-xs text-gray-400">Bangicode</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Sheet — 4 sides
        </h2>
        <div className="flex flex-wrap gap-3">
          {(["left", "right", "top", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm">
                  Open {side}
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet — {side}</SheetTitle>
                  <SheetDescription>
                    Slide-in panel from the {side}. Press Esc or click the ×
                    button to close.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-6 py-4 text-sm text-gray-600">
                  Sheet body content goes here.
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Mobile nav pattern
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Hamburger trigger opens a left Sheet containing the nav items stacked
          vertically. This is the pattern BAN-134 will wire up in the real
          header.
        </p>

        <div className="inline-flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-4 py-3">
          <span className="font-mono text-xs text-gray-400">Bangicode</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Bangicode</SheetTitle>
                <SheetDescription>Navigation</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-6 py-4">
                {NAV_ITEMS.map((item) => (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="font-body text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        BAN-130 · IST-120 (token wiring) · BAN-134 (top nav assembly)
      </footer>
    </main>
  );
}
