import { NextResponse, type NextRequest } from "next/server";
import { loadAdminConfig } from "@/lib/admin/config";
import { safeNextPath, setSession } from "@/lib/admin/session";
import { signIn } from "@/lib/admin/users";
import { redirectOrigin } from "@/lib/admin/redirect-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sign-in with a local account. See ADR 0003.
 *
 * POST only, and a form post rather than a fetch, so it works before hydration
 * and nothing prefetches it.
 *
 * Failure reasons stay coarse for the same reason the OAuth flow's did: a
 * precise message tells someone probing the form which half they got right.
 * "locked" is the exception, because it is the one a legitimate person will hit
 * and can act on — and it reveals nothing that five failed attempts have not
 * already told the attacker.
 */
function fail(
  request: NextRequest,
  reason: string,
  next: string | null,
): NextResponse {
  const url = new URL("/admin/login", redirectOrigin(request));
  url.searchParams.set("error", reason);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const next = safeNextPath(String(form.get("next") ?? ""));

  const result = loadAdminConfig();
  if (!result.ok) {
    // Built from the request, not SITE_URL: this branch runs precisely when
    // configuration is missing, and SITE_URL may be one of the missing things.
    return fail(request, "not_configured", next);
  }

  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return fail(request, "invalid_credentials", next);

  let outcome;
  try {
    outcome = await signIn(email, password);
  } catch {
    // The database is configured but unreachable. Distinct from bad
    // credentials: telling someone their password is wrong when the server
    // cannot check it sends them resetting a password that was fine.
    return fail(request, "unavailable", next);
  }

  if (!outcome.ok) {
    return fail(
      request,
      outcome.reason === "locked" ? "locked" : "invalid_credentials",
      next,
    );
  }

  await setSession(
    {
      userId: outcome.user.id,
      email: outcome.user.email,
      name: outcome.user.name,
    },
    result.config.sessionSecret,
  );

  // 303 so the browser follows with GET rather than re-POSTing.
  return NextResponse.redirect(
    new URL(next ?? "/admin", redirectOrigin(request)),
    {
      status: 303,
    },
  );
}
