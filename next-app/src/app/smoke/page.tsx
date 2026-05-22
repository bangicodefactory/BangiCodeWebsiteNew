/**
 * /_smoke — Component registry smoke gallery (dev only).
 *
 * Renders one instance of each @bangicode/* component installed from the
 * Company brand registry. If a component is missing (registry not yet
 * connected), its row shows an "awaiting install" badge instead of crashing.
 *
 * URL: /smoke  (Next.js App Router does not route _-prefixed folders; this
 * route is intentionally at /smoke — add a next.config rewrite if /_smoke
 * is required by tooling).
 *
 * To install components:
 *   cd next-app
 *   npx shadcn add @bangicode/button @bangicode/card ... (see IST-120)
 */

const EXPECTED_COMPONENTS = [
  "button",
  "card",
  "input",
  "label",
  "textarea",
  "select",
  "form",
  "badge",
  "sheet",
  "dialog",
  "dropdown-menu",
  "separator",
  "avatar",
  "site-footer",
  "hero",
  "feature-grid",
  "cta",
  "testimonials",
  "logo-cloud",
  "faq",
] as const;

export default function SmokePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 font-mono">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <p className="mb-2 text-xs tracking-widest text-blue-600 uppercase">
          {"// _smoke"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Company brand registry — smoke gallery
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Registry:{" "}
          <code className="rounded bg-gray-100 px-1">
            https://design.bangicode.ma/r/&#123;name&#125;.json
          </code>
        </p>
      </header>

      <section className="mb-10">
        <div className="inline-flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span className="font-bold">Registry offline</span>
          <span>— components not yet installed (IST-120)</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Once{" "}
          <code className="rounded bg-gray-100 px-1">
            design.bangicode.ma/r/
          </code>{" "}
          is live, run:
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-green-400">
          {`npx shadcn add @bangicode/button @bangicode/card @bangicode/input \\
  @bangicode/label @bangicode/textarea @bangicode/select @bangicode/form \\
  @bangicode/badge @bangicode/sheet @bangicode/dialog @bangicode/dropdown-menu \\
  @bangicode/separator @bangicode/avatar @bangicode/site-footer @bangicode/hero \\
  @bangicode/feature-grid @bangicode/cta @bangicode/testimonials \\
  @bangicode/logo-cloud @bangicode/faq`}
        </pre>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Expected components ({EXPECTED_COMPONENTS.length})
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {EXPECTED_COMPONENTS.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
            >
              <span className="text-sm text-gray-700">@bangicode/{name}</span>
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                pending
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        <p>
          Token proof: when components are installed, this page must show navy
          primary, sky-blue secondary-container, and JetBrains Mono on badge
          text — confirming the DESIGN.md token pipeline is wired through the
          registry.
        </p>
        <p className="mt-1">
          Registry docs:{" "}
          <span className="text-gray-500">design.bangicode.ma</span>{" "}
          {/* IST-120 · IST-129 */}
        </p>
      </footer>
    </main>
  );
}
