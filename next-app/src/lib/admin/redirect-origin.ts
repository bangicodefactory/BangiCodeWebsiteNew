import type { NextRequest } from "next/server";

/**
 * The origin a redirect from a Route Handler must be built against.
 *
 * `new URL(path, request.url)` is the obvious thing and it is wrong here. In a
 * Route Handler behind Phusion Passenger, `request.url` is the address the Node
 * process is BOUND to, not the address the visitor asked for — so sign-in
 * redirected to `https://0.0.0.0:3000/admin` and a browser followed it straight
 * off the internet. curl hid the bug by following the Location header anyway;
 * only opening it in a browser, or reading the header, shows it.
 *
 * Middleware does not have this problem — there `request.url` is the external
 * URL — which is why /admin bounced to the right host while the login POST did
 * not. Two different notions of "the request", one API.
 *
 * Order of preference:
 *   1. the reverse proxy's own account of the request (X-Forwarded-*)
 *   2. the Host header
 *   3. request.url, which is right in dev and wrong behind Passenger
 *
 * SITE_URL is deliberately NOT consulted. It is the CANONICAL origin, and using
 * it would bounce anyone signing in on the staging host over to production
 * mid-flow, dropping the session cookie they just received.
 */
export function redirectOrigin(request: NextRequest): string {
  const headers = request.headers;

  const forwardedHost = headers.get("x-forwarded-host");
  if (forwardedHost) {
    // Only ever the first entry: proxies append, and the left-most is the one
    // the client actually asked for.
    const host = forwardedHost.split(",")[0]?.trim();
    const proto =
      headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    if (host) return `${proto}://${host}`;
  }

  const host = headers.get("host");
  if (host && !host.startsWith("0.0.0.0") && !host.startsWith("127.0.0.1")) {
    // Passenger terminates TLS upstream, so a bare Host header on a public
    // deployment means https. In dev the fallback below handles http.
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
