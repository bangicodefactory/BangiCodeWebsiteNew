import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { BRAND } from "@/lib/brand-colors";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.hero" });

  return new ImageResponse(
    <div
      style={{
        background: BRAND.navy,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "60px 72px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 6,
          background: BRAND.sky,
          display: "flex",
        }}
      />

      {/* Logo wordmark */}
      <div
        style={{
          color: BRAND.white,
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-2px",
          lineHeight: 1,
          display: "flex",
        }}
      >
        Bangicode
      </div>

      {/* Tagline */}
      <div
        style={{
          color: BRAND.sky,
          fontSize: 28,
          marginTop: 20,
          display: "flex",
        }}
      >
        {t("tagline")}
      </div>

      {/* Location badge */}
      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 18,
          marginTop: 16,
          fontFamily: "monospace",
          display: "flex",
        }}
      >
        bangicode.ma · Tetouan, Morocco
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
