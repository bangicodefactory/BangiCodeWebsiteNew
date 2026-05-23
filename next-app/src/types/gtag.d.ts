// GA4 gtag is conditionally present — gated by cookie consent (BAN-156).
interface Window {
  gtag?: (...args: unknown[]) => void;
}
