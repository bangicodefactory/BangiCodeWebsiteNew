const BASE_URL = process.env.SITE_URL ?? "https://bangicode.ma";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Bangicode SARL",
    url: BASE_URL,
    logo: `${BASE_URL}/brand/logo.svg`,
    email: "admin@bangicode.ma",
    telephone: "+212664571370",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tetouan",
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

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    name: "Bangicode SARL",
    url: BASE_URL,
    email: "admin@bangicode.ma",
    telephone: "+212664571370",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tetouan",
      addressCountry: "MA",
    },
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
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@id": `${BASE_URL}/#organization` },
    name,
    description,
    url,
    areaServed: { "@type": "Country", name: "Morocco" },
    serviceType: "Software Development",
  };
}
