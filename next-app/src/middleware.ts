import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/smoke")) {
    // Gate the smoke gallery: 404 unless SMOKE_GALLERY=1 is set.
    // Set SMOKE_GALLERY=1 in .env.local for local dev.
    if (process.env.SMOKE_GALLERY !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // i18n routes — excludes smoke, Next.js internals, static files
    "/((?!_next|_vercel|smoke|.*\\..*).*)",
    // smoke routes — intercepted above for production gating
    "/smoke",
    "/smoke/(.*)",
    "/",
  ],
};
