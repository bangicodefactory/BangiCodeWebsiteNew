import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SmokeVersionStrip } from "@/components/smoke/smoke-version-strip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// hover:border-secondary-container will resolve once IST-120 wires the @theme.
// The inline shadow value comes from DESIGN.md §Elevation "flat-plus / tech shadow".
const hoverCard =
  "transition-[border-color,box-shadow] hover:border-secondary-container hover:shadow-[0_4px_12px_rgba(26,54,115,0.08)]";

export default function SmokeCardPage() {
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
          {"// _smoke / card"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          @bangicode/card — anatomy + hover
        </h1>
        <p className="mt-2 text-sm text-gray-500">Anatomy + hover state</p>
        <SmokeVersionStrip name="card" />
      </header>

      <section className="mb-10">
        <div className="space-y-2 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            <strong>Tokens pending (IST-120):</strong> brand colour classes (
            <code className="rounded bg-amber-100 px-1">bg-card</code>,{" "}
            <code className="rounded bg-amber-100 px-1">border-border</code>,{" "}
            <code className="rounded bg-amber-100 px-1">
              border-secondary-container
            </code>
            ) resolve to browser defaults until the registry{" "}
            <code className="rounded bg-amber-100 px-1">@theme</code> is wired.
          </p>
          <p>
            <strong>Hover border + shadow:</strong> applied via a thin wrapper
            class today (upstream hover state not yet shipped). Remove wrapper
            once library merges and IST-120 ships.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Default anatomy
        </h2>
        <div className="max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Supporting description text.</CardDescription>
            </CardHeader>
            <CardContent>
              Body content goes here. Uses{" "}
              <code className="rounded bg-gray-100 px-1">
                font-hanken-grotesk
              </code>{" "}
              at 14px.
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm" type="button">
                Action
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Hover state — outline → sky-blue + tech shadow
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Hover each card. Border transitions to{" "}
          <code className="rounded bg-gray-100 px-1">secondary-container</code>{" "}
          (#5cb8fd) with{" "}
          <code className="rounded bg-gray-100 px-1">
            0 4px 12px rgba(26,54,115,0.08)
          </code>{" "}
          shadow per DESIGN.md §Elevation.
        </p>
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {["Service A", "Service B"].map((label) => (
            <Card key={label} className={hoverCard}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>
                  Hover to see the border + shadow transition.
                </CardDescription>
              </CardHeader>
              <CardContent>Placeholder body content.</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          A11y — full-card link (no nested links)
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Card with a primary link uses a single full-card target via{" "}
          <code className="rounded bg-gray-100 px-1">
            after:absolute after:inset-0
          </code>{" "}
          on the anchor — no nested interactive elements inside the card.
        </p>
        <div className="max-w-sm">
          <Card
            className={`relative cursor-pointer ${hoverCard} has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-sky-400 has-[a:focus-visible]:ring-offset-2`}
          >
            <CardHeader>
              <CardTitle>
                <Link
                  href="/smoke/card"
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  Friterie.ma case study
                </Link>
              </CardTitle>
              <CardDescription>
                POS + inventory system — Tetouan, 2024.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Single tap target covers the entire card. No secondary links
              inside.
            </CardContent>
            <CardFooter>
              <span className="text-xs text-gray-400" aria-hidden="true">
                Read case study →
              </span>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          RTL — dir=&quot;rtl&quot;
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Padding and content order use CSS logical properties — no manual
          mirroring needed.
        </p>
        <div
          dir="rtl"
          className="max-w-sm rounded border border-dashed border-gray-200 p-4"
        >
          <Card className={hoverCard}>
            <CardHeader>
              <CardTitle>عنوان البطاقة</CardTitle>
              <CardDescription>نص وصفي داعم.</CardDescription>
            </CardHeader>
            <CardContent>محتوى الجسم يذهب هنا.</CardContent>
            <CardFooter>
              <Button variant="primary" size="sm" type="button">
                إجراء
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        BAN-128 · IST-120 (registry + token wiring) · BAN-138 / BAN-139–143 /
        BAN-148 (consumers)
      </footer>
    </main>
  );
}
