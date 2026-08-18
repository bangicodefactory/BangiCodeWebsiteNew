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
   * Hit target: 40×44. The comment here used to claim 48px while the class said
   * h-9 — 36px, under the 40px a thumb wants and only just over WCAG 2.2 SC
   * 2.5.8's 24px floor. h-10 makes the number and the claim agree.
   *
   * The track is `p-0.5` (2px) around a `rounded-full` control, which is
   * concentric by construction: a pill inside a pill is correct at any padding,
   * because both radii are already larger than half the height.
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
          /*
           * The press scale matches Button's 0.96. This is the one control on
           * the bar that navigates without looking like a button, so the tactile
           * acknowledgement matters more here than on something already obviously
           * pressable — and a locale switch reloads the route, which means the
           * press is the only feedback there is before the page changes.
           */
          className={`inline-flex h-10 min-w-[44px] items-center justify-center rounded-full px-3 font-mono text-xs tracking-wider uppercase transition-[color,background-color,scale] duration-200 ease-out focus-visible:outline-none active:scale-[0.96] active:duration-[120ms] ${
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
