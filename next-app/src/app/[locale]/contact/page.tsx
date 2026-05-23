import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ContactForm } from "./ContactForm";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("h1"), description: t("subhead") };
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "212664571370";

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("h1")}
        </h1>
        <p className="font-body text-muted-foreground max-w-xl text-lg">
          {t("subhead")}
        </p>
      </section>

      {/* Form + office info */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            {/* Form — 2/3 width */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Office info — 1/3 width */}
            <aside>
              <p
                dir="ltr"
                className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase"
              >
                {t("officeEyebrow")}
              </p>

              <address className="font-body text-muted-foreground not-italic">
                <p className="text-foreground mb-1 text-sm font-semibold">
                  Bangicode SARL
                </p>
                {t("officeAddress")
                  .split("\n")
                  .map((line) => (
                    <p key={line} className="text-sm">
                      {line}
                    </p>
                  ))}
                <p className="mt-3 text-sm">{t("officeHours")}</p>
              </address>

              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-container focus-visible:ring-ring rounded-sm font-mono text-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {t("officeWhatsApp")}
                </a>
                <a
                  href={`mailto:${t("officeEmail")}`}
                  className="text-secondary-container focus-visible:ring-ring rounded-sm font-mono text-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {t("officeEmail")}
                </a>
              </div>

              {/* Static map embed — OpenStreetMap */}
              <div className="mt-8 overflow-hidden rounded-sm">
                <iframe
                  title={t("mapTitle")}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-5.3833%2C35.5667%2C-5.3433%2C35.5867&layer=mapnik&marker=35.5767%2C-5.3633"
                  width="100%"
                  height="200"
                  className="border-border block border"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
