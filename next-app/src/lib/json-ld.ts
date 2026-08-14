export const BASE_URL = process.env.SITE_URL ?? "https://bangicode.ma";

/*
 * `description` is passed in rather than hardcoded, because these schemas are
 * rendered inside [locale] pages. Hardcoding English here would emit English
 * structured data on /fr and /ar — the same defect that hardcoded <meta> tags
 * had, reproduced one layer down. Callers hand it the same Meta.description the
 * page's own metadata uses, so the two can never drift.
 */
export function organizationSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Bangicode SARL",
    url: BASE_URL,
    logo: `${BASE_URL}/brand/logo.svg`,
    description,
    email: "contact@bangicode.ma",
    telephone: "+212664571370",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Av. Ali Yaeta, Centre Commercial Wilaya Center, Etage 6, N69",
      addressLocality: "Tétouan",
      addressRegion: "Tanger-Tétouan-Al Hoceïma",
      addressCountry: "MA",
    },
    sameAs: [
      "https://linkedin.com/company/bangicode",
      "https://github.com/bangicodefactory",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Bangicode",
    publisher: { "@id": `${BASE_URL}/#organization` },
  };
}

/** Same reasoning as organizationSchema: localized by the caller. */
export function localBusinessSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    name: "Bangicode SARL",
    url: BASE_URL,
    description,
    email: "contact@bangicode.ma",
    telephone: "+212664571370",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Av. Ali Yaeta, Centre Commercial Wilaya Center, Etage 6, N69",
      addressLocality: "Tétouan",
      addressRegion: "Tanger-Tétouan-Al Hoceïma",
      addressCountry: "MA",
    },
    areaServed: { "@type": "Country", name: "Morocco" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };
}

export function serviceSchema({
  name,
  description,
  url,
  serviceType = "Software Development",
}: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@id": `${BASE_URL}/#organization` },
    name,
    description,
    url,
    areaServed: { "@type": "Country", name: "Morocco" },
    serviceType,
  };
}
