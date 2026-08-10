"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { trackBookingCompleted } from "@/lib/analytics";
import { BRAND } from "@/lib/brand-colors";

/**
 * Calendly inline booking widget. See docs/adr/0004-calendly-booking.md.
 *
 * Loaded from Calendly's script rather than the `react-calendly` package. The
 * widget is a script plus a div, the wrapper adds a dependency for that, and
 * this project has twice shipped a bug caused by a dependency that resolved on
 * a developer machine and not where the code ran (`@mdx-js/mdx`, then `mysql2`
 * in the standalone bundle). One fewer package in the graph is worth thirty
 * lines here.
 *
 * The event URL is NOT hardcoded — see NEXT_PUBLIC_CALENDLY_URL. Without it
 * the component renders the same fallback it shows when Calendly is
 * unreachable, so an unconfigured deploy offers email and WhatsApp rather than
 * an empty box.
 */

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

/** Set in .env.local / cPanel. Example: https://calendly.com/you/30min */
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

const FALLBACK_EMAIL = "admin@bangicode.ma";
const FALLBACK_WA = "https://wa.me/212664571370";

interface CalendlyWindow extends Window {
  Calendly?: {
    initInlineWidget(options: {
      url: string;
      parentElement: HTMLElement;
      prefill?: Record<string, unknown>;
    }): void;
  };
}

/*
 * One shared promise for the whole app: navigating away and back must not
 * append a second copy of the script, and two widgets on one page must not
 * race each other.
 */
let widgetPromise: Promise<void> | null = null;

function loadWidget(): Promise<void> {
  if (widgetPromise) return widgetPromise;

  widgetPromise = new Promise<void>((resolve, reject) => {
    if ((window as CalendlyWindow).Calendly) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("calendly")));
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("calendly"));
    document.head.appendChild(script);
  }).catch((error) => {
    // Let the next mount retry rather than caching the failure forever — a
    // blocked script on one page load is often a transient network problem.
    widgetPromise = null;
    throw error;
  });

  return widgetPromise;
}

/**
 * Colour params, built from the brand tokens rather than typed as literals.
 *
 * Calendly wants bare hex with no leading `#`. Reading them from
 * `lib/brand-colors` means the widget cannot drift from the palette the way a
 * pasted value would — the same reason the OG image imports from there.
 */
function brandedUrl(url: string): string {
  if (!url) return "";
  const u = new URL(url);
  u.searchParams.set("hide_gdpr_banner", "1");
  u.searchParams.set("primary_color", BRAND.navy.replace("#", ""));
  u.searchParams.set("text_color", BRAND.ink950.replace("#", ""));
  u.searchParams.set("background_color", "ffffff");
  return u.toString();
}

interface FallbackProps {
  message: string;
  contactLabel: string;
  whatsAppLabel: string;
}

function BookingFallback({
  message,
  contactLabel,
  whatsAppLabel,
}: FallbackProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
      <a
        href={`mailto:${FALLBACK_EMAIL}`}
        className="text-accent text-sm underline underline-offset-4"
      >
        {contactLabel} {FALLBACK_EMAIL}
      </a>
      <a
        href={FALLBACK_WA}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent text-sm underline underline-offset-4"
      >
        {whatsAppLabel}
      </a>
    </div>
  );
}

interface CalendlyInlineProps {
  /** Overrides NEXT_PUBLIC_CALENDLY_URL. Mainly for tests. */
  url?: string;
  /** Where to land after a booking, e.g. "/?booked=true". */
  bookedPath?: string;
}

export function CalendlyInline({
  url = CALENDLY_URL,
  bookedPath = "/?booked=true",
}: CalendlyInlineProps) {
  const t = useTranslations("Booking");
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!url);

  // Latest-ref so the effect below never restarts the widget just because a
  // render produced a new function identity.
  const bookedRef = useRef(bookedPath);
  useEffect(() => {
    bookedRef.current = bookedPath;
  }, [bookedPath]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    loadWidget()
      .then(() => {
        if (cancelled || !container.current) return;
        const w = window as CalendlyWindow;
        if (!w.Calendly) return setFailed(true);
        w.Calendly.initInlineWidget({
          url: brandedUrl(url),
          parentElement: container.current,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  /*
   * Calendly reports a completed booking by postMessage, not by redirect —
   * its own redirect option is a per-event setting in their dashboard, which
   * code cannot reach. Handling it here keeps the existing ?booked=true toast
   * working and keeps the confirmation on our own domain.
   *
   * The origin check is the security boundary: any page can postMessage to
   * this window, so without it a hostile frame could fake a booking and push
   * the visitor wherever it liked.
   */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://calendly.com") return;
      const data: unknown = event.data;
      if (
        typeof data !== "object" ||
        data === null ||
        (data as { event?: unknown }).event !== "calendly.event_scheduled"
      ) {
        return;
      }
      trackBookingCompleted(url || "calendly");
      router.push(bookedRef.current);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router, url]);

  if (failed) {
    return (
      <BookingFallback
        message={t("fallback")}
        contactLabel={t("fallbackContact")}
        whatsAppLabel={t("fallbackWhatsApp")}
      />
    );
  }

  return (
    <div
      ref={container}
      data-testid="calendly-inline"
      className="h-full w-full"
      // The widget writes its own iframe in here; React must not manage it.
      suppressHydrationWarning
    />
  );
}
