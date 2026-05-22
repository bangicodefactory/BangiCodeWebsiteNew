#!/usr/bin/env node
/**
 * Fails CI if the registry-version.json pin is stale (> 14 days old).
 * Exits 0 (skips) when status is "pending" — registry not yet deployed.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pinPath = join(__dirname, "..", "registry-version.json");

let pin;
try {
  pin = JSON.parse(readFileSync(pinPath, "utf8"));
} catch {
  console.error(`check-registry-pin: cannot read ${pinPath}`);
  process.exit(1);
}

if (pin.status === "pending") {
  console.log(
    "check-registry-pin: registry not yet deployed — skipping staleness check.",
  );
  process.exit(0);
}

if (!pin.installedAt) {
  console.error(
    "check-registry-pin: installedAt is missing and status is not pending.",
  );
  process.exit(1);
}

const installedMs = new Date(pin.installedAt).getTime();
const ageMs = Date.now() - installedMs;
const ageDays = ageMs / (1000 * 60 * 60 * 24);
const STALE_DAYS = 14;

if (ageDays > STALE_DAYS) {
  console.error(
    `check-registry-pin: pin is ${ageDays.toFixed(1)} days old (limit: ${STALE_DAYS}).` +
      ` Run: npx shadcn add @bangicode/<name> and update registry-version.json.`,
  );
  process.exit(1);
}

console.log(
  `check-registry-pin: pin is ${ageDays.toFixed(1)} days old — OK (limit: ${STALE_DAYS}).`,
);
