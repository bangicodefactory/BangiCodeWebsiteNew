export const CONSENT_COOKIE = "bgc_consent_v1";
export const CONSENT_EXPIRY_DAYS = 365;

export type ConsentValue = "accepted" | "declined";

export function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`),
  );
  return match?.[1] ? (decodeURIComponent(match[1]) as ConsentValue) : null;
}

export function setConsent(value: ConsentValue): void {
  const expires = new Date();
  expires.setTime(
    expires.getTime() + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}
