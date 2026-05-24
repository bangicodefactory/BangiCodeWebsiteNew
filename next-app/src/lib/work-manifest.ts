import manifestJson from "../../content/work/manifest.json";

export interface CaseHero {
  placeholder: boolean;
  webp: string;
  alt: string;
  width: number;
  height: number;
}

export interface CaseEntry {
  slug: string;
  hero: CaseHero;
}

const manifest = manifestJson as { cases: CaseEntry[] };

const caseMap = new Map<string, CaseEntry>(
  manifest.cases.map((c) => [c.slug, c]),
);

export function getCaseHero(slug: string): CaseHero | null {
  return caseMap.get(slug)?.hero ?? null;
}
