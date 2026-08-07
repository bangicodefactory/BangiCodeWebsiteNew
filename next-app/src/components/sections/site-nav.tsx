"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
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
    { label: t("services"), href: "/services" },
    { label: t("solutions"), href: "/solutions" },
    { label: t("portfolio"), href: "/portfolio" },
    { label: t("about"), href: "/about" },
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
  return (
    <header
      data-surface="dark"
      className={`bg-background sticky top-0 z-40 h-14 w-full transition-[background-color,border-color,box-shadow] sm:h-16 ${
        scrolled ? "border-border border-b shadow-lg backdrop-blur-sm" : ""
      }`}
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
          <Button variant="spark" size="sm" asChild>
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
              <nav
                className="mt-4 flex flex-col gap-1"
                aria-label={t("mobileNav")}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
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
                  header's data-surface="dark" scope and stays light. */}
              <div className="border-border mt-auto border-t pt-4">
                <LocaleSwitcher currentLocale={locale} hideNavRole />
                <div className="mt-3">
                  <Button variant="spark" size="sm" className="w-full" asChild>
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
