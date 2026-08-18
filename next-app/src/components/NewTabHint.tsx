import { getTranslations } from "next-intl/server";

/**
 * Visually-hidden "(opens in a new tab)" for links that carry target="_blank".
 *
 * Every outbound link on the site opened a new tab with nothing announcing it,
 * so a screen-reader user heard "Visit drivedesk.ma", activated it, and landed
 * in a new context with no back button and no warning. WCAG 3.2.5 asks for the
 * change of context to be predictable.
 *
 * A child element rather than an aria-label, deliberately: aria-label REPLACES
 * the accessible name, so using it here would mean restating the link text in
 * every locale and keeping the two in sync forever. As a child it appends to
 * whatever the link already says.
 *
 * Note the leading space — screen readers concatenate text nodes without one,
 * which would produce "drivedesk.ma(opens in a new tab)".
 *
 * Links that set their own aria-label (WhatsAppCta) cannot use this, because
 * the label would override it; those append the string to the label instead.
 */
export async function NewTabHint() {
  const t = await getTranslations("Common");
  return <span className="sr-only"> {t("opensInNewTab")}</span>;
}
