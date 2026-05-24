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

  return (
    <Wrapper {...wrapperProps} className="flex gap-1">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={`inline-flex h-12 min-w-[48px] items-center justify-center rounded px-3 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
            locale === currentLocale
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </Wrapper>
  );
}
