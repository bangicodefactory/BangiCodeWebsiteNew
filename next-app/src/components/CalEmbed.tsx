"use client";

import { Component, type ReactNode, useEffect, useRef } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export const CAL_EVENT_SLUG =
  process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "bangicode/30min-discovery";

const FALLBACK_EMAIL = "hello@bangicode.ma";
const FALLBACK_WA = "https://wa.me/212664571370";

// GA4 fired only when the consent-gated gtag is present (BAN-156).
function fireGA4Booking() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "booking_completed");
  }
}

// --- Error boundary -----------------------------------------------------------

class CalErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CalFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground text-sm">
        Booking widget unavailable.
      </p>
      <a
        href={`mailto:${FALLBACK_EMAIL}`}
        className="text-primary text-sm underline"
      >
        {FALLBACK_EMAIL}
      </a>
      <a
        href={FALLBACK_WA}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-sm underline"
      >
        WhatsApp
      </a>
    </div>
  );
}

// --- Inline embed -------------------------------------------------------------

interface CalInlineProps {
  eventSlug?: string;
  locale: string;
  /** Redirect URL passed to Cal.com after a successful booking. */
  redirectUrl?: string;
  onBooked?: () => void;
}

export function CalInline({
  eventSlug = CAL_EVENT_SLUG,
  locale,
  redirectUrl,
  onBooked,
}: CalInlineProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    getCalApi({ namespace: "inline" })
      .then((cal) => {
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            fireGA4Booking();
            onBooked?.();
          },
        });
      })
      .catch(() => {
        // Embed script failed to load — CalFallback handles the UI.
      });
  }, [onBooked]);

  const config: Record<string, string> = { locale, layout: "month_view" };
  if (redirectUrl) config.redirectUrl = redirectUrl;

  return (
    <CalErrorBoundary fallback={<CalFallback />}>
      <Cal
        namespace="inline"
        calLink={eventSlug}
        config={config}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </CalErrorBoundary>
  );
}

// --- Modal trigger ------------------------------------------------------------

interface CalBookButtonProps {
  eventSlug?: string;
  locale: string;
  onBooked?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Button that opens a Cal.com modal popup.
 * Uses data-cal-* attributes so the Cal embed script handles the click.
 * Pair with a single `<CalModalInit>` somewhere higher in the tree.
 */
export function CalBookButton({
  eventSlug = CAL_EVENT_SLUG,
  locale,
  children,
  className,
}: CalBookButtonProps) {
  return (
    <button
      type="button"
      data-cal-namespace="modal"
      data-cal-link={eventSlug}
      data-cal-config={JSON.stringify({ locale, layout: "month_view" })}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * Mount once in a layout/page alongside `<CalBookButton>`.
 * Preloads the modal namespace and wires the bookingSuccessful handler.
 */
export function CalModalInit({
  eventSlug = CAL_EVENT_SLUG,
  locale,
  onBooked,
}: Omit<CalInlineProps, "redirectUrl">) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    getCalApi({ namespace: "modal" })
      .then((cal) => {
        cal("ui", { hideEventTypeDetails: false });
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            fireGA4Booking();
            onBooked?.();
          },
        });
      })
      .catch(() => {
        // Script failed to load — silent; button falls back to href gracefully.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invisible seed element that initialises the namespace.
  return (
    <Cal
      namespace="modal"
      calLink={eventSlug}
      config={{ locale }}
      style={{ display: "none" }}
    />
  );
}
