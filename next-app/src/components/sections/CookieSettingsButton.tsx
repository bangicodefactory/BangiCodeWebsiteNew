"use client";

import { useTranslations } from "next-intl";

export function CookieSettingsButton() {
  const t = useTranslations("CookieBanner");

  function openSettings() {
    window.dispatchEvent(new CustomEvent("bgc:open-settings"));
  }

  return (
    <button
      type="button"
      onClick={openSettings}
      className="font-body text-primary focus-visible:ring-ring rounded-sm text-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
    >
      {t("managePreferences")}
    </button>
  );
}
