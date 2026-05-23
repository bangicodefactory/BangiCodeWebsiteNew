import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { SmokeVersionStrip } from "@/components/smoke/smoke-version-strip";

const VARIANTS: NonNullable<ButtonProps["variant"]>[] = [
  "primary",
  "secondary",
  "ghost",
  "destructive",
  "link",
];

const SIZES: NonNullable<ButtonProps["size"]>[] = ["sm", "md", "lg", "icon"];

export default function SmokeButtonPage() {
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
          {"// _smoke / button"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">@bangicode/button</h1>
        <p className="mt-2 text-sm text-gray-500">5 variants × 4 sizes</p>
        <SmokeVersionStrip name="button" />
      </header>

      <section className="mb-10">
        <div className="space-y-2 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            <strong>Tokens pending (IST-120):</strong> brand colour classes (
            <code className="rounded bg-amber-100 px-1">bg-primary</code>,{" "}
            <code className="rounded bg-amber-100 px-1">border-secondary</code>,
            etc.) resolve to browser defaults until the registry{" "}
            <code className="rounded bg-amber-100 px-1">@theme</code> is wired.
          </p>
          <p>
            <strong>Focus ring invisible:</strong>{" "}
            <code className="rounded bg-amber-100 px-1">
              focus-visible:ring-ring
            </code>{" "}
            requires{" "}
            <code className="rounded bg-amber-100 px-1">--color-ring</code>. The
            button suppresses the global outline via{" "}
            <code className="rounded bg-amber-100 px-1">
              focus-visible:outline-none
            </code>{" "}
            — there is currently <strong>no visible focus indicator</strong>{" "}
            until IST-120 ships.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Variants × sizes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="pr-8 pb-3 text-left text-xs font-medium text-gray-400">
                  variant \ size
                </th>
                {SIZES.map((size) => (
                  <th
                    key={size}
                    className="pr-6 pb-3 text-left text-xs font-medium text-gray-400"
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant} className="border-t border-gray-100">
                  <td className="py-4 pr-8 text-xs text-gray-500">{variant}</td>
                  {SIZES.map((size) => (
                    <td key={size} className="py-4 pr-6">
                      <Button variant={variant} size={size} type="button">
                        {size === "icon" ? (
                          <Plus className="size-4" />
                        ) : (
                          "Label"
                        )}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Focus ring (WCAG 2.2 AA — 2px sky-blue + 2px offset)
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Tab to each button. Ring is currently invisible (see token warning
          above) — verify it becomes sky-blue once IST-120 ships.
        </p>
        <div className="flex flex-wrap gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="md" type="button">
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          RTL — dir=&quot;rtl&quot;
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          The{" "}
          <code className="rounded bg-gray-100 px-1">&lt;ArrowRight&gt;</code>{" "}
          icon flips to the inline-end side via CSS logical properties — no
          manual mirroring needed.
        </p>
        <div
          dir="rtl"
          className="flex flex-wrap gap-3 rounded border border-dashed border-gray-200 p-4"
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="md" type="button">
              <ArrowRight className="size-4" />
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Hero CTA — locked copy per CLAUDE.md
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Must read &quot;Start a project&quot; — NOT &quot;Let&apos;s
          Build&quot;.
        </p>
        <Button variant="primary" size="lg" type="button">
          Start a project
        </Button>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          prefers-reduced-motion
        </h2>
        <p className="text-xs text-gray-400">
          The{" "}
          <code className="rounded bg-gray-100 px-1">transition-colors</code>{" "}
          class on the base variant is collapsed to{" "}
          <code className="rounded bg-gray-100 px-1">0.01ms</code> by the global{" "}
          <code className="rounded bg-gray-100 px-1">
            @media (prefers-reduced-motion: reduce)
          </code>{" "}
          rule in <code className="rounded bg-gray-100 px-1">globals.css</code>.
        </p>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        BAN-127 · IST-120 (registry wiring) · IST-129 (full smoke gallery)
      </footer>
    </main>
  );
}
