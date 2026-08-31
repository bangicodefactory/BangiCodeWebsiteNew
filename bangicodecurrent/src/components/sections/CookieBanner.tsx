"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/cookie-consent";

declare global {
  interface WindowEventMap {
    "bgc:consent": CustomEvent<{ analytics: boolean }>;
    "bgc:open-settings": CustomEvent<Record<string, never>>;
  }
}

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleOpenSettings() {
      setVisible(true);
    }

    window.addEventListener("bgc:open-settings", handleOpenSettings);

    // Show banner on first visit by dispatching through the same path as
    // the "reopen" button — keeps setState inside a callback, not effect body.
    if (getConsent() === null) {
      window.dispatchEvent(new CustomEvent("bgc:open-settings"));
    }

    return () =>
      window.removeEventListener("bgc:open-settings", handleOpenSettings);
  }, []);

  const accept = useCallback(() => {
    setConsent("accepted");
    setVisible(false);
    window.dispatchEvent(
      new CustomEvent("bgc:consent", { detail: { analytics: true } }),
    );
  }, []);

  const decline = useCallback(() => {
    setConsent("declined");
    setVisible(false);
    window.dispatchEvent(
      new CustomEvent("bgc:consent", { detail: { analytics: false } }),
    );
  }, []);

  if (!visible) return null;

  const isRtl = locale === "ar";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("label")}
      dir={isRtl ? "rtl" : "ltr"}
      className="cookie-banner border-border bg-background fixed start-0 end-0 bottom-0 z-50 border-t p-4 shadow-lg sm:start-4 sm:end-auto sm:bottom-4 sm:max-w-sm sm:rounded-lg sm:border"
    >
      <p className="font-body text-foreground mb-3 text-sm leading-relaxed">
        {t("body")}{" "}
        <Link
          href="/legal/cookies"
          /*
           * Underlined at rest, not just on hover. This link sits inside a
           * paragraph, and navy-700 on ink-950 body text is under the 3:1 that
           * WCAG 1.4.1 requires before colour may be the sole distinguisher —
           * axe flags it as link-in-text-block. Local audits missed it because
           * the banner only renders for visitors who have not chosen yet.
           */
          className="text-primary focus-visible:ring-ring rounded-sm underline underline-offset-2 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("learnMore")}
        </Link>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={accept}
          className="flex-1 sm:flex-none"
        >
          {t("accept")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={decline}
          className="flex-1 sm:flex-none"
        >
          {t("decline")}
        </Button>
      </div>
    </div>
  );
}
