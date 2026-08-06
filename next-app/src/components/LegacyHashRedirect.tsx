"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

const HASH_MAP: Record<string, string> = {
  "#about": "/about",
  "#services": "/services",
  "#work": "/portfolio",
  "#portfolio": "/portfolio",
  "#process": "/process",
  "#contact": "/contact",
};

export function LegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = HASH_MAP[hash.toLowerCase()];
    if (target) {
      router.replace(target);
    }
  }, [router]);

  return null;
}
