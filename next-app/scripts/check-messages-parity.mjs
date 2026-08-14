#!/usr/bin/env node
/*
 * Fails if messages/{en,fr,ar}.json drift apart.
 *
 * next-intl does not error on a missing key at build time — it falls back to
 * rendering the key path itself, so a page ships reading "Home.faq.q03" to
 * Arabic visitors and every check stays green. That is the same silent-failure
 * class as the unstyled-token bug in ADR 0001, and it wants the same treatment:
 * a guard that runs in CI.
 *
 * The realistic regression is adding a key to `en` while writing the feature and
 * translating later — so this compares full key PATHS, not counts, and reports
 * exactly which paths are missing where.
 *
 * Checks:
 *   1. identical key sets across all three locales
 *   2. no empty or whitespace-only values
 *   3. no value left identical to its en source in a namespace that must be
 *      translated (catches copy-paste-and-forget), with an allowlist for the
 *      strings that are legitimately locale-invariant — brand names, emails,
 *      numerals, mono markers.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["en", "fr", "ar"];
const REFERENCE = "en";

/*
 * Values that are identical across locales ON PURPOSE. Kept deliberately narrow:
 * every entry here is a hole in check 3, so prefer an exact key over a pattern.
 *
 * Structural families — proper nouns, metric values, step numbers, tech stacks.
 */
const INVARIANT_PATTERNS = [
  /Name$/, // RentFlow, TableServe, Scholaris, ShopCore, client names
  /Client$/, // RentCar.ma, Coinluminaire, …
  /Value$/, // 24+, -60%, 3→1, 99.9%, 2020, 4
  /[Nn]umber$/, // 01–04
  /Tags$/, // "React · Laravel · Git · Docker"
  /^Home\.testimonial\.(author|company)$/,
  /^Home\.(founder\.email|status\.sprint)$/,
  /^Footer\.(linkedin|github|whatsapp)$/,
];

/*
 * Exact keys where EN and the target language genuinely share the word, or the
 * value is a format rather than prose.
 *
 * Footer.copyright is the odd one out: it is identical in all three locales
 * because CLAUDE.md locks the line verbatim as a legal/brand string.
 */
const INVARIANT_KEYS = new Set([
  // "E-commerce" is the same word in French
  "Home.services.s02Title",
  "Home.solutions.p04Tag",
  "Solutions.p04Tag",
  "Services.overview.s02Title",
  "Services.ecommerce.eyebrow",
  "Contact.formServiceEcommerce",
  "Work.filterEcommerce",
  "Careers.practiceEcommerce",
  "Footer.ecommerce",
  // shared EN/FR words
  "Nav.services",
  "Nav.contact",
  "Nav.solutions",
  "Nav.blog",
  "Nav.mobileTitle", // "Navigation"
  "Footer.servicesTitle", // "// services"
  "Footer.contact",
  "Footer.cookies",
  "Work.filterWeb",
  "Work.filterSocial",
  // formats, brand and tech names
  "Home.process.step01Time", // "~5 min"
  "Process.step01Time",
  "Home.founder.whatsapp",
  "Contact.officeWhatsApp",
  "Contact.formNamePlaceholder", // "Ahmed Benali"
  "Contact.formEmailPlaceholder", // "you@example.com"
  "Contact.officeEmail", // contact@bangicode.ma
  "Home.featuredCase.client", // "RentCar.ma"
  "Services.training.cap02Title", // "Laravel & PHP"
  // locked by CLAUDE.md — must read identically in every locale
  "Footer.copyright",
]);

function isInvariant(key) {
  return (
    INVARIANT_KEYS.has(key) || INVARIANT_PATTERNS.some((re) => re.test(key))
  );
}

function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v]],
  );
}

const catalogs = Object.fromEntries(
  LOCALES.map((l) => [
    l,
    Object.fromEntries(
      flatten(
        JSON.parse(
          readFileSync(path.join(ROOT, "messages", `${l}.json`), "utf8"),
        ),
      ),
    ),
  ]),
);

const problems = [];
const refKeys = Object.keys(catalogs[REFERENCE]);

// 1 — key parity
for (const locale of LOCALES.filter((l) => l !== REFERENCE)) {
  const keys = Object.keys(catalogs[locale]);
  for (const k of refKeys) {
    if (!(k in catalogs[locale])) problems.push(`${locale}: MISSING  ${k}`);
  }
  for (const k of keys) {
    if (!(k in catalogs[REFERENCE])) problems.push(`${locale}: EXTRA    ${k}`);
  }
}

// 2 — no empty values
for (const locale of LOCALES) {
  for (const [k, v] of Object.entries(catalogs[locale])) {
    if (typeof v !== "string") {
      problems.push(`${locale}: NOT-A-STRING ${k}`);
    } else if (v.trim() === "") {
      problems.push(`${locale}: EMPTY    ${k}`);
    }
  }
}

// 3 — untranslated leftovers
let invariantHits = 0;
for (const locale of LOCALES.filter((l) => l !== REFERENCE)) {
  for (const k of refKeys) {
    if (!(k in catalogs[locale])) continue;
    if (catalogs[locale][k] !== catalogs[REFERENCE][k]) continue;
    if (isInvariant(k)) {
      invariantHits++;
      continue;
    }
    problems.push(
      `${locale}: UNTRANSLATED ${k} — still "${String(catalogs[locale][k]).slice(0, 48)}"`,
    );
  }
}

if (problems.length > 0) {
  console.error("check-messages-parity: FAILED\n");
  for (const p of problems.slice(0, 60)) console.error("  " + p);
  if (problems.length > 60) {
    console.error(`  … and ${problems.length - 60} more`);
  }
  console.error(
    "\nIf a value is meant to be identical across locales (a brand name, an\n" +
      "email, a numeral), add its key pattern to INVARIANT in this script.",
  );
  process.exit(1);
}

console.log(
  `check-messages-parity: OK — ${refKeys.length} keys identical across ${LOCALES.join("/")}, ` +
    `no empty values, ${invariantHits} intentionally shared values allowlisted.`,
);
