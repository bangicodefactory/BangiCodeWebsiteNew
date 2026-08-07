"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { trackLocaleSwitch } from "@/lib/analytics";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

export function LocaleSwitcher({
  currentLocale,
  hideNavRole = false,
}: {
  currentLocale: string;
  hideNavRole?: boolean;
}) {
  const t = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: Locale) {
    trackLocaleSwitch(currentLocale, nextLocale);
    router.replace(pathname, { locale: nextLocale });
  }

  const Wrapper = hideNavRole ? "div" : "nav";
  const wrapperProps = hideNavRole ? {} : { "aria-label": t("label") };

  /*
   * Design D renders this as a segmented control: a pill-shaped track with the
   * active locale as a filled sky pill.
   *
   * ⚠ Accessibility contract — e2e/smoke.spec.ts asserts a `nav` with an
   * accessible name matching /language/i containing EXACTLY three `button`s.
   * Keep the element types and the aria-label; restyle freely. Do not add a
   * second switcher elsewhere on the page (e.g. the footer) — two matching
   * navs break the strict-mode locator.
   *
   * The 48px hit target is deliberate (WCAG 2.5.8); the visual pill is smaller.
   */
  return (
    <Wrapper
      {...wrapperProps}
      className="border-border/60 bg-muted/60 inline-flex items-center gap-0.5 rounded-full border p-0.5"
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={`inline-flex h-9 min-w-[44px] items-center justify-center rounded-full px-3 font-mono text-xs tracking-wider uppercase transition-colors duration-200 ease-out focus-visible:outline-none ${
            locale === currentLocale
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </Wrapper>
  );
}
