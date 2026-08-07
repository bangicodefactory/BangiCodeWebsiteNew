import { NextResponse, type NextRequest } from "next/server";
import { loadAdminConfig } from "@/lib/admin/config";
import { randomToken } from "@/lib/admin/crypto";
import { authorizeUrl } from "@/lib/admin/github-oauth";
import { safeNextPath, setOAuthState } from "@/lib/admin/session";

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
export async function POST(request: NextRequest) {
  const result = loadAdminConfig();
  if (!result.ok) {
    // Built from the request, not from SITE_URL: this branch runs precisely
    // when configuration is missing, and SITE_URL is one of the things that
    // may be missing — falling back to a localhost origin would redirect a
    // production visitor to their own machine.
    return NextResponse.redirect(
      new URL("/admin/login?error=not_configured", request.url),
    );
  }

  const state = randomToken();
  // Sealed into the state cookie rather than round-tripped through GitHub, so
  // the destination cannot be swapped between the redirect and the callback.
  const next = safeNextPath(
    String((await request.formData()).get("next") ?? ""),
  );
  await setOAuthState(state, result.config.sessionSecret, next);

  // 303: turn the POST into a GET when the browser follows to GitHub.
  return NextResponse.redirect(authorizeUrl(result.config, state), {
    status: 303,
  });
}
