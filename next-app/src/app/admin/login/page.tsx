import Image from "next/image";
import { loadAdminConfig } from "@/lib/admin/config";
import { safeNextPath } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/**
 * Error copy is intentionally coarse. "That email and password do not match"
 * says nothing about WHICH was wrong, so the form cannot be used to find out
 * which addresses have accounts. `users.ts` backs that up by hashing a dummy
 * password for unknown emails, so the timing does not give away what the words
 * withhold.
 *
 * `locked` is the deliberate exception: it is the message a legitimate person
 * will actually hit, they can act on it, and it reveals nothing that five
 * failed attempts have not already revealed.
 */
const ERRORS: Record<string, string> = {
  not_configured:
    "The CMS is not configured on this server yet. See the setup steps below.",
  invalid_credentials: "That email and password do not match.",
  locked:
    "Too many failed attempts. This account is locked for a few minutes — wait, then try again.",
  unavailable:
    "Could not reach the database to check your sign-in. This is a server problem, not your password.",
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
            Accounts are created by an administrator — there is no sign-up.
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
           * A plain form POST with no client JavaScript. This page is the one
           * that has to work when everything else is degraded, and `autoComplete`
           * is set properly so password managers recognise it — the guidance
           * everywhere else in this project is to use a generated password, and
           * a form managers cannot fill is a form people type weak passwords
           * into.
           */}
          <div className="mt-8">
            {result.ok ? (
              <form
                action="/admin/auth/login"
                method="post"
                className="flex flex-col gap-5"
              >
                {nextPath ? (
                  <input type="hidden" name="next" value={nextPath} />
                ) : null}

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="font-body text-foreground text-sm font-medium"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    dir="ltr"
                    className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-sm border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="font-body text-foreground text-sm font-medium"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    dir="ltr"
                    className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-sm border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="spark"
                  size="lg"
                  className="w-full"
                >
                  Sign in
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
