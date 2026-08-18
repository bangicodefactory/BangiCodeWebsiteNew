import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * 301 from the `www.` host to the canonical one derived from SITE_URL.
 *
 * Both hosts currently serve byte-identical content with no redirect between
 * them, and the old site's only canonical signal (`og:url`) points at www while
 * the new site is canonicalised on the apex. Left alone that is duplicate
 * content, and the OAuth callback would break for anyone arriving on the wrong
 * host — GitHub matches the redirect_uri exactly.
 *
 * This lives here rather than in cPanel → Domains → Redirects because that
 * feature writes to the same `.htaccess` the Node app manages, and one
 * regenerates the other. Here it is version-controlled and testable.
 *
 * Derived from SITE_URL rather than hardcoded so staging and local runs do not
 * inherit a production redirect.
 */
function canonicalHostRedirects() {
  const siteUrl = process.env.SITE_URL ?? "https://bangicode.ma";
  let host: string;
  try {
    host = new URL(siteUrl).host;
  } catch {
    return [];
  }
  /*
   * Nothing to do if the canonical host IS the www one, or this is a local
   * run. `localhost` alone missed 127.0.0.1 and ::1, which CI and some local
   * setups use — those would have inherited a production redirect to
   * https://www.127.0.0.1.
   */
  const hostname = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  const isLocal =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  if (host.startsWith("www.") || isLocal) return [];

  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: `www.${host}` }],
      destination: `https://${host}/:path*`,
      permanent: true,
    },
  ];
}

const nextConfig: NextConfig = {
  /*
   * Standalone output, only when BUILD_STANDALONE=1.
   *
   * The site is deployed to Namecheap shared hosting (cPanel → "Setup Node.js
   * App", i.e. Phusion Passenger). Two constraints drive this:
   *
   *  - Shared hosting memory caps make `next build` unreliable ON the box, so
   *    the build happens in GitHub Actions and only the output is shipped.
   *  - Passenger runs a startup file; `.next/standalone/server.js` is exactly
   *    that, and it bundles only the traced dependencies, so there is no
   *    `npm install` on the server and no 300MB node_modules to upload.
   *
   * Conditional rather than always-on so local dev, CI and both Playwright
   * suites keep using `next start` unchanged — standalone changes how the app
   * is launched, and quietly switching that under the tests would mean the
   * thing being tested is no longer the thing being deployed.
   */
  ...(process.env.BUILD_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  /*
   * Content is read at runtime with paths built from process.cwd(), which the
   * file tracer cannot follow. It currently guesses right for
   * content/portfolio and content/legal — but content/blog/{en,fr,ar} are
   * EMPTY today, so nothing is traced from them, and the first post published
   * through the CMS could be absent from the deployed bundle while being
   * present in the repo. That failure looks like "the post exists on GitHub but
   * 404s on the site", which is a horrible thing to debug.
   *
   * Declaring them removes the guesswork. content/work is deliberately absent:
   * it is orphaned MDX nothing imports (ADR 0002).
   */
  outputFileTracingIncludes: {
    "/**": [
      "./content/blog/**/*",
      "./content/portfolio/**/*",
      "./content/legal/**/*",
    ],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
    deviceSizes: [640, 750, 828, 1080, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // www → apex. First, so every other rule sees the canonical host.
      ...canonicalHostRedirects(),
      // Legacy CRA entry point — 301 to root
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      /*
       * /work → /portfolio (ADR 0001, Design D's IA).
       *
       * Both the locale-prefixed and the bare forms are listed so the rules hold
       * whichever runs first, the next-intl middleware or these redirects. If the
       * middleware wins, /work becomes /en/work and the prefixed rule catches it;
       * if these win, the bare rule sends it straight to /en/portfolio. Either
       * path is a single 301 as far as a crawler is concerned.
       *
       * Twelve case-study URLs are live under /work/<slug>, so the :slug rules
       * are not optional — dropping them would 404 every inbound deep link.
       */
      {
        source: "/:locale(en|fr|ar)/work",
        destination: "/:locale/portfolio",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|ar)/work/:slug",
        destination: "/:locale/portfolio/:slug",
        permanent: true,
      },
      {
        source: "/work",
        destination: "/en/portfolio",
        permanent: true,
      },
      {
        source: "/work/:slug",
        destination: "/en/portfolio/:slug",
        permanent: true,
      },
      /*
       * /solutions/rentflow → /solutions.
       *
       * RentFlow was an invented placeholder name for the rental-and-fleet
       * pattern. It has been replaced by DriveDesk, a real product on its own
       * domain, so the slug no longer resolves and would 404 for anything
       * holding the old URL — including a crawler that already indexed it from
       * the sitemap.
       *
       * The target is /solutions rather than drivedesk.ma: a 301 should land on
       * a page we control, and /solutions now leads with DriveDesk anyway.
       * Both the prefixed and bare forms, for the same middleware-ordering
       * reason as the /work rules above.
       */
      {
        source: "/:locale(en|fr|ar)/solutions/rentflow",
        destination: "/:locale/solutions",
        permanent: true,
      },
      {
        source: "/solutions/rentflow",
        destination: "/en/solutions",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
