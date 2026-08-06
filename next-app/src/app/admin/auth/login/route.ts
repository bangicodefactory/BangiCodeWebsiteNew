import { NextResponse } from "next/server";
import { loadAdminConfig } from "@/lib/admin/config";
import { randomToken } from "@/lib/admin/crypto";
import { authorizeUrl } from "@/lib/admin/github-oauth";
import { setOAuthState } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starts the OAuth dance: mint a `state`, remember it in a sealed short-lived
 * cookie, and hand the user to GitHub.
 *
 * `state` is what stops login CSRF — an attacker who can make the victim's
 * browser hit our callback with *their* authorization code would otherwise log
 * the victim into the attacker's account. The callback refuses any code whose
 * state does not match the cookie we set.
 */
export async function POST() {
  const result = loadAdminConfig();
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(
        "/admin/login?error=not_configured",
        process.env.SITE_URL ?? "http://localhost:3000",
      ),
    );
  }

  const state = randomToken();
  await setOAuthState(state, result.config.sessionSecret);

  // 303: turn the POST into a GET when the browser follows to GitHub.
  return NextResponse.redirect(authorizeUrl(result.config, state), {
    status: 303,
  });
}
