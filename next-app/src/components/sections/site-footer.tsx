import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Locale } from "@/i18n/routing";

interface SiteFooterProps {
  locale: Locale;
}

const LINK_CLASS =
  "font-hanken-grotesk text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

const MONO_LINK_CLASS =
  "font-jetbrains-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = await getTranslations("Footer");

  const services: Array<{ label: string; href: string }> = [
    { label: t("customSoftware"), href: "/services" },
    { label: t("ecommerce"), href: "/services" },
    { label: t("training"), href: "/services" },
    { label: t("socialPresence"), href: "/services" },
  ];

  const company: Array<{ label: string; href: string }> = [
    { label: t("about"), href: "/about" },
    { label: t("process"), href: "/process" },
    { label: t("work"), href: "/work" },
    { label: t("careers"), href: "/careers" },
    { label: t("contact"), href: "/contact" },
  ];

  return (
    <footer className="border-border bg-background w-full border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Bangicode — home">
              <Image
                src="/brand/logo.svg"
                alt="Bangicode"
                width={140}
                height={22}
                className="h-[22px] w-auto"
              />
            </Link>
            <p className="font-hanken-grotesk text-muted-foreground text-sm">
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
            <LocaleSwitcher currentLocale={locale} />
          </div>

          <div className="flex flex-col gap-4">
            <p
              dir="ltr"
              className="font-jetbrains-mono text-muted-foreground text-xs tracking-widest uppercase"
            >
              {t("servicesTitle")}
            </p>
            <ul className="list-none space-y-3 p-0">
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
              className="font-jetbrains-mono text-muted-foreground text-xs tracking-widest uppercase"
            >
              {t("companyTitle")}
            </p>
            <ul className="list-none space-y-3 p-0">
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
              className="font-jetbrains-mono text-muted-foreground text-xs tracking-widest uppercase"
            >
              {t("locationTitle")}
            </p>
            <address className="not-italic">
              <p className="font-hanken-grotesk text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                {t("address")}
              </p>
              <div className="mt-3 space-y-1.5">
                <p className="font-jetbrains-mono text-muted-foreground text-xs">
                  {t("hours")}
                </p>
                <a
                  href="tel:+212664571370"
                  className={`block ${MONO_LINK_CLASS}`}
                >
                  +212 664 571 370
                </a>
                <a
                  href="mailto:admin@bangicode.ma"
                  className={`block ${MONO_LINK_CLASS}`}
                >
                  admin@bangicode.ma
                </a>
                <a
                  href="https://wa.me/212664571370"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block ${MONO_LINK_CLASS}`}
                >
                  {t("whatsapp")}
                </a>
              </div>
            </address>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-jetbrains-mono text-muted-foreground text-xs">
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
