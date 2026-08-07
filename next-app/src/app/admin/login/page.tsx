import Image from "next/image";
import { loadAdminConfig } from "@/lib/admin/config";
import { safeNextPath } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/**
 * Error copy is intentionally coarse. `invalid_state` and `exchange_failed`
 * both mean "that sign-in attempt did not check out" to the user; a precise
 * message would tell someone probing the flow exactly which step they cleared.
 * `not_a_member` is the one worth naming, because it is the case a legitimate
 * person will actually hit and needs to act on.
 */
const ERRORS: Record<string, string> = {
  not_configured:
    "The CMS is not configured on this server yet. See the setup steps below.",
  denied: "Sign-in was cancelled.",
  not_a_member:
    "That GitHub account is not an active member of the organisation. Ask an owner for an invitation, then try again.",
  invalid_state:
    "That sign-in attempt could not be verified. Please try again.",
  invalid_request:
    "That sign-in attempt could not be verified. Please try again.",
  exchange_failed:
    "That sign-in attempt could not be verified. Please try again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  // The middleware appends ?next= when it bounces a deep link. It is echoed
  // into the form so sign-in returns you where you were aiming, and validated
  // here as well as on the way out — never trusted as given.
  const nextPath = safeNextPath(next);
  const result = loadAdminConfig();
  const message = error ? (ERRORS[error] ?? ERRORS.exchange_failed) : null;

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="rounded-sm bg-white px-3 py-2">
            <Image
              src="/brand/logo.svg"
              alt="Bangicode"
              width={160}
              height={25}
              priority
              className="h-[25px] w-auto"
            />
          </div>
        </div>

        <div className="border-border bg-card rounded-md border p-8 shadow-sm">
          <p
            dir="ltr"
            className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
          >
            {"// cms"}
          </p>
          <h1 className="font-display text-foreground mt-3 text-2xl font-bold tracking-tight">
            Sign in to publish.
          </h1>
          <p className="font-body text-muted-foreground mt-3 text-sm leading-relaxed">
            Access is limited to active members of the{" "}
            <span className="font-mono text-xs">
              {result.ok ? result.config.githubOrg : "bangicodefactory"}
            </span>{" "}
            organisation on GitHub.
          </p>

          {message ? (
            <p
              role="alert"
              className="border-destructive bg-error-container text-on-error-container font-body mt-6 rounded-sm border-s-2 p-3 text-sm leading-relaxed"
            >
              {message}
            </p>
          ) : null}

          {/*
           * The sign-in control is a form POST, not a link. Starting sign-in is
           * state-changing — the route mints an OAuth `state` and sets a cookie.
           * As a <Link>, Next would prefetch it on hover and burn that state
           * before the user ever clicked; as a bare <a>, a crawler would do the
           * same. POST is both the honest verb and the one nothing prefetches.
           */}
          <div className="mt-8">
            {result.ok ? (
              <form action="/admin/auth/login" method="post">
                {nextPath ? (
                  <input type="hidden" name="next" value={nextPath} />
                ) : null}
                <Button
                  type="submit"
                  variant="spark"
                  size="lg"
                  className="w-full"
                >
                  Continue with GitHub
                </Button>
              </form>
            ) : (
              <div className="border-border bg-muted rounded-sm border p-4">
                <p className="font-body text-foreground text-sm font-medium">
                  Server setup incomplete
                </p>
                <p className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
                  Set these environment variables and restart:
                </p>
                <ul className="text-muted-foreground mt-3 list-none space-y-1 p-0 font-mono text-xs">
                  {result.missing.map((name) => (
                    <li key={name}>· {name}</li>
                  ))}
                  {result.problems.map((problem) => (
                    <li key={problem} className="text-on-error-container">
                      · {problem}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="text-muted-foreground mt-6 text-center font-mono text-xs">
          Published changes are committed to the repository.
        </p>
      </div>
    </main>
  );
}
