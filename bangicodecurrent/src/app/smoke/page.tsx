import Link from "next/link";
import { existsSync } from "fs";
import path from "path";

/*
 * Internal verification surface. Gated by SMOKE_GALLERY=1 in middleware and
 * disallowed in robots.txt.
 *
 * Rewritten for ADR 0001. This page used to narrate a "@bangicode registry
 * offline — run npx shadcn add …" story and told the reader that installing
 * from design.bangicode.ma would prove the DESIGN.md token pipeline. None of
 * that is true any more: the registry was never deployed, the primitives are
 * local, and the tokens are authored in src/styles/tokens.css. It now lists
 * what actually exists and links the pages that actually render.
 */

const PRIMITIVES = [
  "badge",
  "button",
  "card",
  "checkbox",
  "form",
  "input",
  "label",
  "radio-group",
  "select",
  "separator",
  "sheet",
  "switch",
  "textarea",
] as const;

/** Sections with a /smoke/sections/<slug> page. Keep in sync when adding one. */
const SECTIONS = [
  { slug: "hero", component: "HeroSection" },
  { slug: "thesis-line-stats", component: "ThesisLineStats" },
  { slug: "trusted-by-row", component: "TrustedByRow" },
  { slug: "why-bangicode", component: "WhyBangicode" },
  { slug: "services", component: "ServicesSection" },
  { slug: "solutions", component: "SolutionsSection" },
  { slug: "featured-case", component: "FeaturedCase" },
  { slug: "peek-cards", component: "PeekCards" },
  { slug: "what-happens-next", component: "WhatHappensNext" },
  { slug: "testimonials", component: "TestimonialsSection" },
  { slug: "faq", component: "FaqSection" },
  { slug: "founder-card", component: "FounderCard" },
] as const;

/** Primitives that also have a /smoke/<name> page of their own. */
const PRIMITIVE_PAGES = new Set(["badge", "button", "card", "form", "sheet"]);

function primitiveExists(name: string): boolean {
  return existsSync(
    path.join(process.cwd(), "src", "components", "ui", `${name}.tsx`),
  );
}

function sectionExists(component: string): boolean {
  return existsSync(
    path.join(
      process.cwd(),
      "src",
      "components",
      "sections",
      `${component}.tsx`,
    ),
  );
}

function Row({
  label,
  href,
  ok,
}: {
  label: string;
  href: string | null;
  ok: boolean;
}) {
  const inner = (
    <div className="border-border hover:border-secondary flex items-center justify-between rounded-sm border px-3 py-2 transition-colors">
      <span className="text-foreground text-sm">{label}</span>
      <span
        className={`ms-2 rounded-full px-2 py-0.5 font-mono text-xs ${
          ok ? "bg-secondary/15 text-accent" : "bg-muted text-muted-foreground"
        }`}
      >
        {ok ? "✓" : "missing"}
      </span>
    </div>
  );
  return href ? (
    <Link
      href={href}
      className="focus-visible:ring-ring block rounded-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function SmokePage() {
  const primitivesOk = PRIMITIVES.filter(primitiveExists).length;
  const sectionsOk = SECTIONS.filter((s) => sectionExists(s.component)).length;

  return (
    <main className="bg-background max-w-content mx-auto min-h-screen px-6 py-12">
      <header className="border-border mb-10 border-b pb-6">
        <p
          dir="ltr"
          className="text-accent mb-2 font-mono text-xs tracking-widest uppercase"
        >
          {"// _smoke"}
        </p>
        <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
          Component smoke gallery
        </h1>
        <p className="font-body text-muted-foreground mt-2 text-sm">
          Tokens come from{" "}
          <code className="bg-muted rounded-sm px-1 font-mono text-xs">
            src/styles/tokens.css
          </code>
          . See{" "}
          <code className="bg-muted rounded-sm px-1 font-mono text-xs">
            docs/adr/0001-adopt-claude-design-system-tokens.md
          </code>
          .
        </p>
      </header>

      <div className="border-border bg-muted/40 text-muted-foreground mb-10 inline-flex flex-wrap items-center gap-2 rounded-sm border px-3 py-2 text-xs">
        <span className="text-foreground font-semibold">
          Internal — not for users.
        </span>
        <span>
          Gated in production via{" "}
          <code className="bg-muted rounded-sm px-1 font-mono">
            SMOKE_GALLERY=1
          </code>{" "}
          · disallowed in{" "}
          <code className="bg-muted rounded-sm px-1 font-mono">robots.txt</code>
        </span>
      </div>

      <section className="mb-12">
        <h2 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          {`// primitives (${primitivesOk}/${PRIMITIVES.length})`}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {PRIMITIVES.map((name) => {
            const ok = primitiveExists(name);
            return (
              <Row
                key={name}
                label={`ui/${name}`}
                ok={ok}
                href={ok && PRIMITIVE_PAGES.has(name) ? `/smoke/${name}` : null}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          {`// homepage sections (${sectionsOk}/${SECTIONS.length})`}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {SECTIONS.map((s) => {
            const ok = sectionExists(s.component);
            return (
              <Row
                key={s.slug}
                label={s.component}
                ok={ok}
                href={ok ? `/smoke/sections/${s.slug}` : null}
              />
            );
          })}
        </div>
      </section>

      <footer className="border-border text-muted-foreground mt-12 border-t pt-6 font-mono text-xs">
        <p>
          Token proof: this page must render navy headings, sky accents and
          JetBrains Mono labels. If it is black-on-white, the token layer is not
          resolving — run{" "}
          <code className="bg-muted rounded-sm px-1">pnpm check:tokens</code>.
        </p>
      </footer>
    </main>
  );
}
