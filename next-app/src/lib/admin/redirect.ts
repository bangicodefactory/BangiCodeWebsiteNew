import { NextResponse } from "next/server";

/**
 * A redirect that does not need to know its own hostname.
 *
 * `NextResponse.redirect()` demands an absolute URL, and building one inside a
 * Route Handler behind Phusion Passenger produces the WRONG absolute URL:
 * `request.url` there is the address the Node process is bound to, so sign-in
 * redirected to `https://0.0.0.0:3000/admin` and a browser would follow that
 * straight off the internet.
 *
 * The first attempt reconstructed the origin from `X-Forwarded-Host`, falling
 * back to `Host`. It did not work — deployed and restarted, staging still
 * emitted `0.0.0.0:3000`, because this host supplies neither header in a form
 * the handler can see. Guessing at proxy headers means depending on a detail of
 * the hosting that nothing tests and that can change without notice.
 *
 * A RELATIVE Location sidesteps the question entirely. RFC 7231 §7.1.2 permits
 * it, every browser resolves it against the URL actually requested, and it is
 * therefore correct behind any proxy, on any host, with no configuration.
 *
 * Middleware keeps using absolute URLs — there `request.url` IS the external
 * URL, which is why /admin bounced to the right host all along while these
 * handlers did not.
 */
export function redirectTo(
  path: string,
  status: 303 | 307 = 303,
): NextResponse {
  if (!path.startsWith("/")) {
    throw new Error(`redirectTo expects a root-relative path, got "${path}"`);
  }
  // Built by hand rather than with NextResponse.redirect, which resolves the
  // path against an origin and would reintroduce the bug.
  return new NextResponse(null, {
    status,
    headers: { Location: path },
  });
}
