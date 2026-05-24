import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL ?? "https://bangicode.ma";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/smoke/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
