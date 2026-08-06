import { redirect } from "next/navigation";
import { loadAdminConfig, type AdminConfig } from "./config";
import { getSession, type AdminSession } from "./session";

/**
 * Server-side gate for every admin page and mutation.
 *
 * The middleware already rejects unauthenticated requests, but this re-checks
 * rather than trusting it. Middleware is a routing concern and can be bypassed
 * by configuration mistakes (a matcher edit, a rewrite, a future route group);
 * an authorisation check that lives only in middleware is one refactor away from
 * being no check at all. This is the one that actually protects the data, and
 * server actions call it too — they are POST endpoints reachable directly, not
 * just the form on the page.
 */
export async function requireSession(): Promise<{
  session: AdminSession;
  config: AdminConfig;
}> {
  const result = loadAdminConfig();
  if (!result.ok) redirect("/admin/login?error=not_configured");

  const session = await getSession(result.config.sessionSecret);
  if (!session) redirect("/admin/login");

  return { session, config: result.config };
}
