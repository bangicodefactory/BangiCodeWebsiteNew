const BASE_URL = "https://bangicode.ma";

/**
 * Generates hreflang alternates for a given pathname.
 * Pass the locale-stripped path (e.g. "/services", or "" for the home page).
 * Use in page-level generateMetadata to override the layout-level fallback.
 *
 * @example
 * export async function generateMetadata({ params }) {
 *   const { locale } = await params;
 *   return { alternates: buildAlternates("/services", locale) };
 * }
 */
export function buildAlternates(
  pathname: string,
  currentLocale: string,
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const path = pathname === "/" ? "" : pathname;
  return {
    canonical: `${BASE_URL}/${currentLocale}${path}`,
    languages: {
      en: `${BASE_URL}/en${path}`,
      fr: `${BASE_URL}/fr${path}`,
      ar: `${BASE_URL}/ar${path}`,
      "x-default": `${BASE_URL}/en${path}`,
    },
  };
}
