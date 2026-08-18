import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

/*
 * WCAG 2.2 SC 2.5.8 wants every target at least 24×24 CSS px. None of these
 * links are "inline in a sentence", so none of them qualify for that exception —
 * they are standalone links in lists and a nav, and they were measured at 19px
 * (the Services / Company columns) and 16px (LinkedIn, GitHub, and the legal
 * row) on a 375px viewport. Only the address block had been fixed.
 *
 * `py-1.5` adds 12px to each, taking the body links to 31px and the mono links
 * to 28px. `inline-block` is what makes vertical padding actually grow the box —
 * on a pure inline element it paints outside the layout and the hit area does
 * not change — and `w-fit` keeps the focus ring wrapped to the text rather than
 * stretched across the column.
 */
/*
 * The display utility is NOT part of the shared bases below, and that is
 * load-bearing. Composing `${MONO_LINK_CLASS} block` put `inline-block` and
 * `block` in the same class list, and the winner is decided by order in the
 * generated stylesheet, not order in the attribute — so the stacked phone /
 * email / WhatsApp links silently became inline and ran together as
 * "+212 664 571 370contact@bangicode.ma". Each base ships displayless and every
 * consumer picks its own.
 */
const TARGET_SIZE = "inline-block w-fit py-1.5";
const TARGET_SIZE_STACKED = "block w-fit py-1.5";

const LINK_BASE =
  "font-body text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

const MONO_LINK_BASE =
  "font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

const LINK_CLASS = `${LINK_BASE} ${TARGET_SIZE}`;
const MONO_LINK_CLASS = `${MONO_LINK_BASE} ${TARGET_SIZE}`;
// The address block stacks full-width, one link per line.
const MONO_CONTACT_LINK_CLASS = `${MONO_LINK_BASE} ${TARGET_SIZE_STACKED}`;

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  const services: Array<{ label: string; href: string }> = [
    { label: t("customSoftware"), href: "/services" },
    { label: t("ecommerce"), href: "/services" },
    { label: t("training"), href: "/services" },
    { label: t("socialPresence"), href: "/services" },
  ];

  // Process and Careers live here now that the primary nav is Design D's six.
  const company: Array<{ label: string; href: string }> = [
    { label: t("about"), href: "/about" },
    { label: t("process"), href: "/process" },
    { label: t("portfolio"), href: "/portfolio" },
    { label: t("careers"), href: "/careers" },
    { label: t("contact"), href: "/contact" },
  ];

  /*
   * Design D's footer is a dark navy band. `data-surface="dark"` re-points the
   * semantic tokens (see src/styles/tokens.css), so every LINK_CLASS /
   * text-muted-foreground / border-border below resolves to its dark-surface
   * value without a single class change. The 4-column structure and the locked
   * content (services list, copyright line) are unchanged.
   *
   * Logo: white plate interim, same as site-nav — see the note there.
   */
  return (
    <footer
      data-surface="dark"
      className="border-border bg-background w-full border-t"
    >
      <div className="max-w-content mx-auto px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              aria-label="Bangicode — home"
              className="w-fit rounded-sm bg-white px-2.5 py-1.5"
            >
              <Image
                src="/brand/logo.svg"
                alt="Bangicode"
                width={140}
                height={22}
                className="h-[22px] w-auto"
              />
            </Link>
            <p className="font-body text-muted-foreground text-sm">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com/company/bangicode"
                target="_blank"
                rel="noopener noreferrer"
                className={MONO_LINK_CLASS}
              >
                {t("linkedin")}
              </a>
              <a
                href="https://github.com/bangicodefactory"
                target="_blank"
                rel="noopener noreferrer"
                className={MONO_LINK_CLASS}
              >
                {t("github")}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p
              dir="ltr"
              className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
            >
              {t("servicesTitle")}
            </p>
            {/*
             * space-y-1, not space-y-3. The links now carry 12px of their own
             * vertical padding for the target-size fix above, so keeping the
             * old 12px gap would have pushed the row pitch from 31px to 43px
             * and left the column looking unintentionally airy. 4px here lands
             * it at 35px — close to the original rhythm, with a real gap
             * between neighbouring targets.
             */}
            <ul className="list-none space-y-1 p-0">
              {services.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <p
              dir="ltr"
              className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
            >
              {t("companyTitle")}
            </p>
            {/*
             * space-y-1, not space-y-3. The links now carry 12px of their own
             * vertical padding for the target-size fix above, so keeping the
             * old 12px gap would have pushed the row pitch from 31px to 43px
             * and left the column looking unintentionally airy. 4px here lands
             * it at 35px — close to the original rhythm, with a real gap
             * between neighbouring targets.
             */}
            <ul className="list-none space-y-1 p-0">
              {company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <p
              dir="ltr"
              className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
            >
              {t("locationTitle")}
            </p>
            <address className="not-italic">
              <p className="font-body text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                {t("address")}
              </p>
              <div className="mt-3 space-y-0.5">
                <p className="text-muted-foreground font-mono text-xs">
                  {t("hours")}
                </p>
                <a href="tel:+212664571370" className={MONO_CONTACT_LINK_CLASS}>
                  +212 664 571 370
                </a>
                <a
                  href="mailto:contact@bangicode.ma"
                  className={MONO_CONTACT_LINK_CLASS}
                >
                  contact@bangicode.ma
                </a>
                <a
                  href="https://wa.me/212664571370"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={MONO_CONTACT_LINK_CLASS}
                >
                  {t("whatsapp")}
                </a>
              </div>
            </address>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground font-mono text-xs">
            {t("copyright")}
          </p>
          <nav aria-label={t("legalNav")} className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className={MONO_LINK_CLASS}>
              {t("privacy")}
            </Link>
            <Link href="/legal/terms" className={MONO_LINK_CLASS}>
              {t("terms")}
            </Link>
            <Link href="/legal/cookies" className={MONO_LINK_CLASS}>
              {t("cookies")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
