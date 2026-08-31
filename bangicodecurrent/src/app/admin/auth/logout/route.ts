import type { NextResponse } from "next/server";
import { clearSession } from "@/lib/admin/session";
import { redirectTo } from "@/lib/admin/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST only. A GET logout is a CSRF footgun — any <img src="/admin/auth/logout">
 * on a page the admin visits would sign them out. Combined with the SameSite=Lax
 * cookie, a cross-site POST cannot carry the session either.
 */
export async function POST(): Promise<NextResponse> {
  await clearSession();
  return redirectTo("/admin/login");
}
