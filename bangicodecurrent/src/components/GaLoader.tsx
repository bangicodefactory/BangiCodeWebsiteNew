"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { getConsent } from "@/lib/cookie-consent";
import {
  initGA,
  grantAnalyticsConsent,
  revokeAnalyticsConsent,
  trackEvent,
} from "@/lib/analytics";

export function GaLoader() {
  const pathname = usePathname();
  const [analyticsReady, setAnalyticsReady] = useState(false);

  // Initialize GA script and wire consent events
  useEffect(() => {
    initGA();

    // Defer initial consent check so setState happens inside a RAF callback,
    // not synchronously in the effect body (satisfies react-hooks/set-state-in-effect).
    const rafId = requestAnimationFrame(() => {
      if (getConsent() === "accepted") {
        grantAnalyticsConsent();
        setAnalyticsReady(true);
      }
    });

    function handleConsent(e: CustomEvent<{ analytics: boolean }>) {
      if (e.detail.analytics) {
        grantAnalyticsConsent();
        setAnalyticsReady(true);
      } else {
        revokeAnalyticsConsent();
        setAnalyticsReady(false);
      }
    }

    window.addEventListener("bgc:consent", handleConsent);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("bgc:consent", handleConsent);
    };
  }, []);

  // Fire page_view on consent grant or route change
  useEffect(() => {
    if (!analyticsReady) return;
    trackEvent("page_view", { page_path: pathname });
  }, [pathname, analyticsReady]);

  return null;
}
