import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { sessionSecretOrNull } from "./lib/admin/config";
import { openSession, SESSION_COOKIE } from "./lib/admin/session";

const intlMiddleware = createMiddleware(routing);

/** Reachable without a session — the sign-in page and the OAuth dance itself. */
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/auth/"];

function isAdminPublic(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p),
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/smoke")) {
    // Gate the smoke gallery: 404 unless SMOKE_GALLERY=1 is set.
    // Set SMOKE_GALLERY=1 in .env.local for local dev.
    if (process.env.SMOKE_GALLERY !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  /*
   * /admin is outside the [locale] tree — it is an internal, English-only
   * surface like /smoke, and must not be locale-prefixed.
   *
   * The session is fully DECRYPTED and expiry-checked here, not merely sniffed
   * for presence. That is why src/lib/admin/crypto.ts is built on Web Crypto
   * rather than node:crypto: middleware runs on the Edge runtime, where
   * node:crypto does not exist. A presence check would let any forged cookie
   * through to the page layer.
   *
   * Pages re-check anyway — defence in depth, and the layout needs the session
   * object regardless.
   */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (isAdminPublic(pathname)) return NextResponse.next();

    const secret = sessionSecretOrNull();

    /*
     * FAIL CLOSED. An earlier version returned next() here so /admin could
     * render setup instructions — which meant a server deployed without
     * ADMIN_SESSION_SECRET had a completely open admin. No session can exist
     * without a secret to seal it, so "unconfigured" must deny, not allow.
     * /admin/login is in ADMIN_PUBLIC_PATHS and still explains what to set.
     */
    if (!secret) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("error", "not_configured");
      return NextResponse.redirect(url);
    }

    const session = await openSession(
      request.cookies.get(SESSION_COOKIE)?.value,
      secret,
    );
    if (!session) {
      const url = new URL("/admin/login", request.url);
      // Bounce back to the page they wanted once signed in. Only same-origin
      // paths are ever echoed, so this cannot be turned into an open redirect.
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // i18n routes — excludes admin, smoke, Next.js internals, static files
    "/((?!_next|_vercel|smoke|admin|.*\\..*).*)",
    // smoke routes — intercepted above for production gating
    "/smoke",
    "/smoke/(.*)",
    // admin routes — intercepted above for the session guard
    "/admin",
    "/admin/(.*)",
    "/",
  ],
};
