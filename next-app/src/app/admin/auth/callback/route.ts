import { NextResponse, type NextRequest } from "next/server";
import { loadAdminConfig } from "@/lib/admin/config";
import { timingSafeEqual } from "@/lib/admin/crypto";
import {
  exchangeCodeForToken,
  fetchUser,
  isOrgMember,
} from "@/lib/admin/github-oauth";
import { setSession, takeOAuthState } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth callback. Order matters — each step gates the next:
 *
 *   1. state matches the single-use cookie   (blocks login CSRF)
 *   2. code exchanges for an access token    (proves GitHub authorised it)
 *   3. token identifies a real user
 *   4. that user is an ACTIVE member of the org  ← the actual authorisation
 *
 * Step 4 is the one that matters. Steps 1–3 only establish *who* is asking;
 * being a GitHub user grants nothing on its own.
 *
 * Failures redirect back to the login page with a coarse reason code. They are
 * deliberately coarse: a precise error would tell an attacker which step they
 * cleared.
 */
function fail(request: NextRequest, reason: string): NextResponse {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const result = loadAdminConfig();
  if (!result.ok) return fail(request, "not_configured");
  const config = result.config;

  const params = request.nextUrl.searchParams;

  // The user pressed "Cancel" on GitHub's consent screen.
  if (params.get("error")) return fail(request, "denied");

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) return fail(request, "invalid_request");

  const expectedState = await takeOAuthState(config.sessionSecret);
  if (!expectedState || !timingSafeEqual(state, expectedState)) {
    return fail(request, "invalid_state");
  }

  const exchange = await exchangeCodeForToken(config, code);
  if (!exchange.ok) return fail(request, "exchange_failed");

  const user = await fetchUser(exchange.accessToken, config.githubApiUrl);
  if (!user) return fail(request, "exchange_failed");

  const member = await isOrgMember(
    exchange.accessToken,
    config.githubOrg,
    config.githubApiUrl,
  );
  if (!member) return fail(request, "not_a_member");

  await setSession(
    {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      accessToken: exchange.accessToken,
    },
    config.sessionSecret,
  );

  return NextResponse.redirect(new URL("/admin", request.url));
}
