import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/admin/session";
import { redirectOrigin } from "@/lib/admin/redirect-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST only. A GET logout is a CSRF footgun — any <img src="/admin/auth/logout">
 * on a page the admin visits would sign them out. Combined with the SameSite=Lax
 * cookie, a cross-site POST cannot carry the session either.
 */
export async function POST(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(
    new URL("/admin/login", redirectOrigin(request)),
    {
      status: 303,
    },
  );
}
