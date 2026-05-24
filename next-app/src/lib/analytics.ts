declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

function isDebug(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debug_ga");
}

export function initGA(): void {
  if (!GA_ID || typeof window === "undefined") return;
  if (document.getElementById("ga-script")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Consent mode v2 — default denied until user accepts
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    wait_for_update: 500,
  });

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function grantAnalyticsConsent(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
}

export function revokeAnalyticsConsent(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  if (isDebug()) {
    console.log("[GA4]", name, params);
  }
  window.gtag("event", name, params);
}

export function trackCtaClick(
  ctaLabel: string,
  page: string,
  locationOnPage: string,
): void {
  trackEvent("cta_click", {
    cta_label: ctaLabel,
    page,
    location_on_page: locationOnPage,
  });
}

export function trackCaseStudyView(slug: string, practice: string): void {
  trackEvent("case_study_view", { slug, practice });
}

export function trackContactFormSubmit(projectType: string): void {
  trackEvent("contact_form_submit", { project_type: projectType });
}

export function trackBookingCompleted(eventSlug: string): void {
  trackEvent("booking_completed", { event_slug: eventSlug });
}

export function trackWhatsappClick(page: string): void {
  trackEvent("whatsapp_click", { page });
}

export function trackLocaleSwitch(from: string, to: string): void {
  trackEvent("locale_switch", { from, to });
}

export function trackNavClick(item: string): void {
  trackEvent("nav_click", { item });
}
