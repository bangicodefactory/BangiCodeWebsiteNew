"use client";

import { Component, type ReactNode, useEffect, useRef } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useTranslations } from "next-intl";
import { trackBookingCompleted } from "@/lib/analytics";

// Resolved in lib/cal.ts so /book's server component can read it too — see the
// note there for why there is no default.
export { CAL_EVENT_SLUG } from "@/lib/cal";
import { CAL_EVENT_SLUG, CAL_GUESTS } from "@/lib/cal";

const FALLBACK_EMAIL = "hello@bangicode.ma";
const FALLBACK_WA = "https://wa.me/212664571370";

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

interface CalFallbackProps {
  message: string;
  contactLabel: string;
  whatsAppLabel: string;
}

function CalFallback({
  message,
  contactLabel,
  whatsAppLabel,
}: CalFallbackProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
      <a
        href={`mailto:${FALLBACK_EMAIL}`}
        className="text-primary text-sm underline"
      >
        {contactLabel} {FALLBACK_EMAIL}
      </a>
      <a
        href={FALLBACK_WA}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-sm underline"
      >
        {whatsAppLabel}
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
  const t = useTranslations("Booking");
  const initialized = useRef(false);
  // Latest-refs: keep callbacks current across re-renders without restarting the embed effect.
  const onBookedRef = useRef(onBooked);
  const eventSlugRef = useRef(eventSlug);
  useEffect(() => {
    onBookedRef.current = onBooked;
  }, [onBooked]);
  useEffect(() => {
    eventSlugRef.current = eventSlug;
  }, [eventSlug]);

  useEffect(() => {
    // Nothing to initialise when unconfigured — the fallback renders instead.
    // Guarded inside the effect rather than before it so the hook order stays
    // unconditional.
    if (!eventSlug) return;
    if (initialized.current) return;
    initialized.current = true;
    getCalApi({ namespace: "inline" })
      .then((cal) => {
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            trackBookingCompleted(eventSlugRef.current ?? eventSlug);
            onBookedRef.current?.();
          },
        });
      })
      .catch(() => {
        // Embed script failed to load — CalFallback handles the UI.
      });
  }, [eventSlug]);

  // Cal.com's PrefillAndIframeAttrsConfig extends Record<string, string | ...> so
  // arbitrary prefill keys (like redirectUrl) are valid even though they're not
  // in KnownConfig. Using Record<string, string | string[]> avoids the import
  // while retaining the open-ended shape of the real type. The array case is
  // `guests`, which Cal.com serialises as a repeated query parameter.
  const config: Record<string, string | string[]> = {
    locale,
    layout: "month_view",
  };
  if (redirectUrl) config.redirectUrl = redirectUrl;
  // Prefills Cal.com's "Add guests" question so both founders are on the
  // invite. See lib/cal.ts for what this does and does not cover.
  if (CAL_GUESTS.length > 0) config.guests = CAL_GUESTS;

  // Unconfigured: show the email + WhatsApp route rather than embedding a 404.
  if (!eventSlug) {
    return (
      <CalFallback
        message={t("fallback")}
        contactLabel={t("fallbackContact")}
        whatsAppLabel={t("fallbackWhatsApp")}
      />
    );
  }

  return (
    <CalErrorBoundary
      fallback={
        <CalFallback
          message={t("fallback")}
          contactLabel={t("fallbackContact")}
          whatsAppLabel={t("fallbackWhatsApp")}
        />
      }
    >
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
  // onBooked is NOT wired here — pass it to <CalModalInit> in the same component tree.
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
  // Unconfigured: a button wired to a missing event opens an empty modal, so
  // degrade to the mail route instead.
  if (!eventSlug) {
    return (
      <a href={`mailto:${FALLBACK_EMAIL}`} className={className}>
        {children}
      </a>
    );
  }

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
 * Pass `onBooked` here (not on CalBookButton) to receive the confirmation callback.
 */
export function CalModalInit({
  eventSlug = CAL_EVENT_SLUG,
  locale,
  onBooked,
}: Omit<CalInlineProps, "redirectUrl">) {
  const initialized = useRef(false);
  // Latest-refs: keep callbacks current across re-renders without restarting the embed effect.
  const onBookedRef = useRef(onBooked);
  const eventSlugRef = useRef(eventSlug);
  useEffect(() => {
    onBookedRef.current = onBooked;
  }, [onBooked]);
  useEffect(() => {
    eventSlugRef.current = eventSlug;
  }, [eventSlug]);

  useEffect(() => {
    if (!eventSlug) return;
    if (initialized.current) return;
    initialized.current = true;
    getCalApi({ namespace: "modal" })
      .then((cal) => {
        cal("ui", { hideEventTypeDetails: false });
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            trackBookingCompleted(eventSlugRef.current ?? eventSlug);
            onBookedRef.current?.();
          },
        });
      })
      .catch(() => {
        // Script failed to load — silent; button falls back to href gracefully.
      });
  }, [eventSlug]);

  // Unconfigured: no namespace to seed. CalBookButton degrades to mailto.
  if (!eventSlug) return null;

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
