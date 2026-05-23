import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceDetailPageProps {
  eyebrow: string;
  h1: string;
  subhead: string;
  capEyebrow: string;
  capabilities: Array<{ title: string; body: string }>;
  stackEyebrow: string;
  stackTags: readonly string[];
  processEyebrow: string;
  steps: readonly string[];
  caseEyebrow: string;
  caseClient: string;
  caseDesc: string;
  caseCtaLabel: string;
  ctaHeadline: string;
  ctaButton: string;
  contactHref?: string;
}

export function ServiceDetailPage({
  eyebrow,
  h1,
  subhead,
  capEyebrow,
  capabilities,
  stackEyebrow,
  stackTags,
  processEyebrow,
  steps,
  caseEyebrow,
  caseClient,
  caseDesc,
  caseCtaLabel,
  ctaHeadline,
  ctaButton,
  contactHref = "/contact",
}: ServiceDetailPageProps) {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
        <p
          dir="ltr"
          className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
        >
          {eyebrow}
        </p>
        <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {h1}
        </h1>
        <p className="font-body text-muted-foreground max-w-xl text-lg">
          {subhead}
        </p>
      </section>

      {/* Capabilities */}
      <section className="border-border border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-10 font-mono text-xs tracking-widest uppercase"
          >
            {capEyebrow}
          </p>
          <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-3">
            {capabilities.map((cap) => (
              <article
                key={cap.title}
                className="bg-background flex flex-col gap-3 p-8"
              >
                <h2 className="font-display text-foreground text-lg font-bold">
                  {cap.title}
                </h2>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {cap.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="bg-surface-container py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase"
          >
            {stackEyebrow}
          </p>
          <div className="flex flex-wrap gap-2">
            {stackTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-muted-foreground mb-10 font-mono text-xs tracking-widest uppercase"
          >
            {processEyebrow}
          </p>
          <ol className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step} className="bg-background flex flex-col gap-3 p-8">
                <span
                  dir="ltr"
                  className="text-secondary-container font-mono text-xs"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured case */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p
            dir="ltr"
            className="text-primary-foreground/60 mb-4 font-mono text-xs tracking-widest uppercase"
          >
            {caseEyebrow}
          </p>
          <h2 className="font-display text-secondary-container mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {caseClient}
          </h2>
          <p className="font-body text-primary-foreground/80 mb-6 max-w-lg text-base leading-relaxed">
            {caseDesc}
          </p>
          <Link
            href={contactHref}
            className="text-secondary-container focus-visible:ring-ring rounded-sm font-mono text-sm underline underline-offset-4 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
          >
            {caseCtaLabel}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border border-t py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {ctaHeadline}
          </h2>
          <Link href={contactHref}>
            <Button variant="primary" size="lg">
              {ctaButton}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
