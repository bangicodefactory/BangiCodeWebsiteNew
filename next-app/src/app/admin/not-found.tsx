import Link from "next/link";
import { Button } from "@/components/ui/button";

/*
 * /admin needs its own not-found. Without one, an unknown admin URL falls
 * through to the ROOT not-found, which sits under the [locale] tree's
 * next-intl provider — it reads request headers, trips
 * DYNAMIC_SERVER_USAGE on a statically generated page, and returns 500
 * instead of 404. Same failure mode as the case-study bug in ADR 0001.
 *
 * A typo in an admin URL should be a 404, not a server error.
 */
export default function AdminNotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="max-w-md text-center">
        <p
          dir="ltr"
          className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
        >
          {"// 404"}
        </p>
        <h1 className="font-display text-foreground mt-3 text-2xl font-bold tracking-tight">
          That page doesn&apos;t exist.
        </h1>
        <p className="font-body text-muted-foreground mt-3 text-sm leading-relaxed">
          The CMS has no screen at this address.
        </p>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link href="/admin">Back to the overview</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
