"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only valid inside a Client Component (Next.js 16 Turbopack
// enforces this). This wrapper owns all three deferred-only-on-client mounts
// so layout.tsx (a Server Component) can use a single <DeferredClientUI />.
const GaLoader = dynamic(
  () => import("@/components/GaLoader").then((m) => ({ default: m.GaLoader })),
  { ssr: false },
);

const CookieBanner = dynamic(
  () =>
    import("@/components/sections/CookieBanner").then((m) => ({
      default: m.CookieBanner,
    })),
  { ssr: false },
);

const WhatsAppCta = dynamic(
  () =>
    import("@/components/WhatsAppCta").then((m) => ({
      default: m.WhatsAppCta,
    })),
  { ssr: false },
);

export function DeferredClientUI() {
  return (
    <>
      <GaLoader />
      <CookieBanner />
      <WhatsAppCta />
    </>
  );
}
