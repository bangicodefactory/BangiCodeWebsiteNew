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

  const navItems: NavLink[] = [
    { label: t("services"), href: "/services" },
    { label: t("work"), href: "/work" },
    { label: t("about"), href: "/about" },
    { label: t("process"), href: "/process" },
    { label: t("careers"), href: "/careers" },
    { label: t("contact"), href: "/contact" },
  ];

  const dir = locale === "ar" ? "rtl" : "ltr";
  const sheetSide = locale === "ar" ? "left" : "right";

  return (
    <header
      className={`sticky top-0 z-40 h-14 w-full transition-[background-color,border-color,box-shadow] sm:h-16 ${
        scrolled
          ? "border-border bg-background/80 border-b shadow-sm backdrop-blur-sm"
          : "bg-background"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Bangicode — home">
          <Image
            src="/brand/logo.svg"
            alt="Bangicode"
            width={182}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav
          className="hidden items-center gap-2 md:flex"
          aria-label={t("desktopNav")}
        >
          <NavigationMenu
            items={navItems}
            dir={dir}
            onItemClick={(item) => trackNavClick(item.label)}
          />
          <LocaleSwitcher currentLocale={locale} />
          <Button variant="primary" size="sm" asChild>
            <Link href="/contact">{t("startProject")}</Link>
          </Button>
        </nav>

        <div className="flex items-center md:hidden">
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
                      trackNavClick(item.label);
                    }}
                    aria-current={
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                        ? "page"
                        : undefined
                    }
                    className={`font-hanken-grotesk hover:bg-muted rounded-sm px-3 py-3 text-sm font-medium transition-colors ${
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
              <div className="border-border mt-auto border-t pt-4">
                <LocaleSwitcher currentLocale={locale} hideNavRole />
                <div className="mt-3">
                  <Button
                    variant="primary"
                    size="sm"
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
