import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL ?? "https://bangicode.ma";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin is auth-gated, but keeping it out of the index means the login
        // page never shows up in search results either.
        disallow: ["/smoke/", "/admin", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
