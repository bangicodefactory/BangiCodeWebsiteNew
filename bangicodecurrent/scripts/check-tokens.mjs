#!/usr/bin/env node
/**
 * Fails if a brand-token utility class is used in src/ but not declared in
 * src/styles/tokens.css.
 *
 * Why this exists: for months every brand class in this codebase — bg-primary,
 * text-foreground, text-muted-foreground, border-border — compiled to NOTHING,
 * because globals.css shipped an empty @theme{} waiting on a registry that was
 * never deployed. Tailwind does not warn about an undefined colour token; the
 * element just renders unstyled. This script makes that failure loud.
 *
 * See docs/adr/0001-adopt-claude-design-system-tokens.md
 *
 * Scope: deliberately narrow. It only inspects class names containing a word
 * from our own colour vocabulary, so Tailwind built-ins (text-xs, border-t,
 * bg-gray-100) are ignored and the signal stays clean.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname, extname, relative } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "src");
const tokensPath = join(srcDir, "styles", "tokens.css");

/* Words that mark a class as belonging to OUR colour vocabulary. */
const VOCAB =
  /(?:foreground|container|surface|muted|accent|destructive|primary|secondary|background|popover|card|border|input|ring|spark|scrim|outline|error|success|warning|ink|navy|sky|red)/;

/*
 * Utility prefixes that take a colour. Longest-first: `ring-offset-background`
 * is ring-offset + the colour `background`, not ring + `offset-background`.
 * Same for side-scoped borders (border-t-border) and axis divides.
 */
const PREFIX =
  "(?:ring-offset|border-[tblrxyse]|divide-[xy]|bg|text|border|ring|divide|fill|stroke|outline|shadow|from|via|to|placeholder|caret|accent|decoration)";

let tokensCss;
try {
  tokensCss = readFileSync(tokensPath, "utf8");
} catch {
  console.error(`check-tokens: cannot read ${tokensPath}`);
  process.exit(1);
}

/* Every --color-* declared in tokens.css, in either @theme block. */
const declared = new Set(
  [...tokensCss.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

if (declared.size === 0) {
  console.error(
    "check-tokens: tokens.css declares no --color-* variables. That is the exact\n" +
      "             failure mode this script exists to catch (see ADR 0001).",
  );
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if ([".tsx", ".ts", ".css"].includes(extname(entry))) out.push(full);
  }
  return out;
}

const classRe = new RegExp(`\\b${PREFIX}-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)`, "g");
const problems = [];

for (const file of walk(srcDir)) {
  if (file === tokensPath) continue;
  const isSmoke =
    file.includes(`${join("app", "smoke")}`) ||
    file.includes(`${join("components", "smoke")}`);
  const text = readFileSync(file, "utf8");

  text.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(classRe)) {
      const name = m[1];
      if (!VOCAB.test(name)) continue; // not our vocabulary
      if (declared.has(name)) continue; // declared — fine
      problems.push({
        file: relative(root, file),
        line: i + 1,
        cls: m[0],
        name,
        isSmoke,
      });
    }
  });
}

/* The smoke gallery intentionally demos raw Tailwind palette colours. */
const real = problems.filter((p) => !p.isSmoke);

if (real.length > 0) {
  console.error("check-tokens: undeclared brand token(s) in use:\n");
  for (const p of real) {
    console.error(
      `  ${p.file}:${p.line}  ${p.cls}  → --color-${p.name} not in tokens.css`,
    );
  }
  console.error(
    `\n${real.length} problem(s). Declare the token in src/styles/tokens.css ` +
      `(in BOTH the light :root and the [data-surface="dark"] scope), or fix the class name.`,
  );
  process.exit(1);
}

console.log(
  `check-tokens: OK — ${declared.size} colour tokens declared, all brand classes in src/ resolve.`,
);
