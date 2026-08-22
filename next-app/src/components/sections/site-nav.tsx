"use client";

import Image from "next/image";
import { useState, useEffect, type CSSProperties } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavigationMenu, type NavLink } from "@/components/nav/navigation-menu";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Locale } from "@/i18n/routing";
import { trackNavClick } from "@/lib/analytics";

interface SiteNavProps {
  locale: Locale;
}

export function SiteNav({ locale }: SiteNavProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /*
   * Two thresholds, not one — the bar floats past 24px and settles back below
   * 8px, so the 16px band between them belongs to whichever state is already
   * current.
   *
   * A single threshold was fine when it toggled a shadow. It now toggles a
   * translucent fill, a 24px backdrop blur and a gradient edge, and a pointer
   * resting near the boundary — a trackpad with inertia, a phone easing to a
   * stop, a mouse wheel one notch shy — would flap all three every frame it
   * crossed. Hysteresis is what stops a boundary from being a knife edge.
   *
   * Reads `scrolled` through the state updater rather than closing over it, so
   * the listener stays mounted once with no stale value and no re-subscribe on
   * every toggle.
   */
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled((was) => (was ? y > 8 : y > 24));
    }
    // Fire once on mount: a reload restores the previous scroll position, and
    // without this the bar renders un-floated over content until the first
    // scroll event.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * Design D's IA. Process and Careers are deliberately out of the primary nav
   * and live in the footer's company column — six items is the ceiling before
   * the bar stops scanning, and these two are the ones visitors seek out rather
   * than browse into.
   */
  const navItems: NavLink[] = [
    /*
     * Home is an explicit item, not only the logo. The logo does link home and
     * always has, but that is a convention people have to know rather than see
     * — and on a deep page like a case study there was no visible way back to
     * the landing page. A named link costs one slot and removes the guess.
     */
    { label: t("home"), href: "/" },
    { label: t("services"), href: "/services" },
    { label: t("solutions"), href: "/solutions" },
    { label: t("portfolio"), href: "/portfolio" },
    { label: t("about"), href: "/about" },
    /*
     * Stays "Blog". It was briefly relabelled "Case studies", which collided
     * with /portfolio — that IS the case studies section (CLAUDE.md defines
     * them as the one-screen project summaries), so the nav offered two
     * entries for the same idea and pointed the clearer name at the emptier
     * page.
     */
    { label: t("blog"), href: "/blog" },
    { label: t("contact"), href: "/contact" },
  ];

  const dir = locale === "ar" ? "rtl" : "ltr";
  const sheetSide = locale === "ar" ? "left" : "right";

  /*
   * Design D's nav is a dark navy bar. `data-surface="dark"` re-points the
   * semantic token layer (see src/styles/tokens.css), so the nav's children —
   * NavigationMenu, LocaleSwitcher, Button — render correctly on navy without
   * any of them needing dark-specific classes.
   *
   * ⚠ The logo is navy + sky + red and CLAUDE.md forbids repainting it, so the
   * navy wordmark would not read on ink-950. Interim: a white rounded plate
   * behind it, which is consistent with the design system's card language.
   * Replace with brand/logo-inverted.svg once that asset exists (CLAUDE.md
   * lists it under "Variants still needed").
   */
  /*
   * The bar becomes a MATERIAL once there is something under it.
   *
   * It carried `backdrop-blur-sm` on scroll already, over a fill that stayed
   * FULLY OPAQUE — so the blur had nothing to reach: the fill behind it was
   * hiding every pixel it would have blurred. The two scroll states were
   * "solid slab" and "solid slab with a shadow".
   *
   * All of the material lives in `.site-chrome` in globals.css rather than in
   * utilities here, for two reasons that both bite in this exact spot:
   * `backdrop-filter` has to declare its identity value at rest or it snaps
   * instead of animating, and `prefers-reduced-transparency` /
   * `prefers-contrast` need to override the whole thing — neither is
   * expressible as a Tailwind variant chain without becoming unreadable.
   *
   * `data-floating` rather than a class swap, so the CSS can key three separate
   * effects (fill, blur, scroll edge) off one attribute and keep them in sync.
   *
   * `border-b border-transparent` looks pointless and is not: it reserves the
   * hairline so `prefers-contrast: more` can colour it in without the bar
   * changing height. No shadow and no visible border in the default path — the
   * scroll edge gradient does that job now.
   */
  return (
    <header
      data-surface="dark"
      data-floating={scrolled ? "true" : undefined}
      className="site-chrome bg-background sticky top-0 z-40 h-14 w-full border-b border-transparent sm:h-16"
    >
      <div className="max-w-content mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Bangicode — home"
          className="rounded-sm bg-white px-2.5 py-1.5"
        >
          <Image
            src="/brand/logo.svg"
            alt="Bangicode"
            width={182}
            height={28}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        {/*
         * lg, not md. At 768px the French labels (Réalisations, Méthodologie,
         * Carrières) plus the locale switcher and the CTA measure ~871px and
         * push the button off-screen. The Sheet covers tablets instead.
         */}
        <nav
          className="hidden items-center gap-3 lg:flex"
          aria-label={t("desktopNav")}
        >
          <NavigationMenu
            items={navItems}
            dir={dir}
            onItemClick={(item) => trackNavClick(item.href)}
          />
          <LocaleSwitcher currentLocale={locale} />
          {/* shape="pill" — the marketing CTA shape. It sits next to a pill
              locale switcher, not next to a form field, so the 10px input
              radius has nothing here to pair with. */}
          <Button variant="spark" size="sm" shape="pill" asChild>
            <Link href="/contact">{t("startProject")}</Link>
          </Button>
        </nav>

        <div className="flex items-center lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={sheetSide} className="flex flex-col gap-0">
              <SheetHeader className="border-border border-b pb-4">
                <Link href="/" onClick={() => setOpen(false)}>
                  <Image
                    src="/brand/logo.svg"
                    alt="Bangicode"
                    width={140}
                    height={22}
                    className="h-[22px] w-auto"
                  />
                </Link>
                <SheetTitle className="sr-only">{t("mobileTitle")}</SheetTitle>
              </SheetHeader>
              {/*
               * sheet-stagger: the rows arrive just behind the panel rather
               * than with it, so the menu reads as opening instead of as a
               * finished picture sliding in. --sheet-i is the row index; the
               * CSS turns it into a 28ms step (see globals.css).
               *
               * Index on the element rather than nth-child so the delay does
               * not silently re-time itself the next time an item is added,
               * removed or reordered in navItems.
               */}
              <nav
                className="sheet-stagger mt-4 flex flex-col gap-1"
                aria-label={t("mobileNav")}
              >
                {navItems.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ "--sheet-i": i } as CSSProperties}
                    onClick={() => {
                      setOpen(false);
                      trackNavClick(item.href);
                    }}
                    aria-current={
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                        ? "page"
                        : undefined
                    }
                    className={`font-body hover:bg-muted rounded-sm px-3 py-3 text-sm font-medium transition-colors ${
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                        ? "bg-muted"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {/* The Sheet renders in a Radix portal, so it sits OUTSIDE the
                  header's data-surface="dark" scope and stays light.

                  The bottom inset is not decorative. SheetContent has no
                  padding of its own, so this block ended flush with the
                  viewport: the CTA measured bottom=812 on a 375×812 emulation,
                  which on any device with a home indicator puts the menu's
                  primary action inside the system gesture strip. `max()` keeps
                  the 24px it had on hardware with no inset and grows to clear
                  the indicator where there is one.

                  The button was also size="sm" — 32px tall for the most
                  important target in the menu, against 44px nav rows above it.
                  size="lg" (48px) matches the weight of the action. */}
              <div className="border-border mt-auto border-t px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <LocaleSwitcher currentLocale={locale} hideNavRole />
                <div className="mt-3">
                  <Button
                    variant="spark"
                    size="lg"
                    shape="pill"
                    className="w-full"
                    asChild
                  >
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      {t("startProject")}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
