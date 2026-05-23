"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const TECH_TAGS = [
  "Laravel",
  "React",
  "Inertia",
  "TypeScript",
  "Next.js",
  "PostgreSQL",
];
const INDUSTRY_TAGS = ["E-commerce", "SaaS", "Logistics"];

function DismissableChip({
  label,
  onDismiss,
}: {
  label: string;
  onDismiss: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="default">{label}</Badge>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Remove ${label}`}
        className="text-foreground/60 hover:text-foreground focus-visible:ring-ring rounded-sm p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function SmokeBadgePage() {
  const [chips, setChips] = useState(TECH_TAGS);

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-mono">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <Link
          href="/smoke"
          className="mb-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft className="size-3" />
          Back to gallery
        </Link>
        <p className="mb-2 text-xs tracking-widest text-blue-600 uppercase">
          {"// _smoke / badge"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">@bangicode/badge</h1>
        <p className="mt-2 text-sm text-gray-500">
          JetBrains Mono · uppercase · 4px radius · 5 variants
        </p>
      </header>

      <section className="mb-10">
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            <strong>Tokens pending (IST-120):</strong>{" "}
            <code className="rounded bg-amber-100 px-1">bg-muted</code>,{" "}
            <code className="rounded bg-amber-100 px-1">bg-primary</code>,{" "}
            <code className="rounded bg-amber-100 px-1">bg-secondary</code>,{" "}
            <code className="rounded bg-amber-100 px-1">text-destructive</code>{" "}
            resolve to browser defaults until the registry{" "}
            <code className="rounded bg-amber-100 px-1">@theme</code> is wired.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Variants
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Tech-tag usage
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          JetBrains Mono uppercase — used in portfolio cards, case-study tech
          stack lists, and service detail pages (BAN-148, BAN-149, BAN-139–143).
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_TAGS.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Two-tone tag system — case studies
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Sky-blue <code className="rounded bg-gray-100 px-1">secondary</code>{" "}
          for tech stack · tertiary-red tint{" "}
          <code className="rounded bg-gray-100 px-1">destructive</code> for
          industry. Per REDESIGN_PLAN.md §1A — tokens correct once IST-120 is
          wired.
        </p>
        <div className="max-w-sm rounded border border-gray-200 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-800">
            RentCar — fleet management
          </p>
          <p className="mb-3 text-xs text-gray-500">
            −60% admin time · 99.9% uptime
          </p>
          <div className="flex flex-wrap gap-2">
            {["Laravel", "React", "Inertia"].map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Badge variant="destructive">Logistics</Badge>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Dismissable chip pattern
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Composed locally: Badge + close button wrapper. No new library
          component needed unless a filter-UI chip (interactive, controlled
          selection) emerges — file upstream if so.
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <DismissableChip
              key={chip}
              label={chip}
              onDismiss={() =>
                setChips((prev) => prev.filter((c) => c !== chip))
              }
            />
          ))}
          {chips.length === 0 && (
            <button
              type="button"
              onClick={() => setChips(TECH_TAGS)}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          RTL
        </h2>
        <div
          dir="rtl"
          className="flex flex-wrap gap-2 rounded border border-dashed border-gray-200 p-4"
        >
          {INDUSTRY_TAGS.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {["Laravel", "React"].map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        <p>
          BAN-131 · IST-120 (token wiring) · BAN-148 (portfolio filter) ·
          BAN-149 (case-study tech stacks)
        </p>
        <p className="mt-1">
          Note: <code className="rounded bg-gray-100 px-1">{"<Badge>"}</code>{" "}
          renders as a{" "}
          <code className="rounded bg-gray-100 px-1">{"<div>"}</code> — avoid
          nesting inside{" "}
          <code className="rounded bg-gray-100 px-1">{"<p>"}</code> or{" "}
          <code className="rounded bg-gray-100 px-1">{"<span>"}</code> (block
          inside inline is invalid HTML).
        </p>
      </footer>
    </main>
  );
}
