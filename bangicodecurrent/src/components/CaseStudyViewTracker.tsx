"use client";

import { useEffect } from "react";
import { trackCaseStudyView } from "@/lib/analytics";

interface Props {
  slug: string;
  practice: string;
}

export function CaseStudyViewTracker({ slug, practice }: Props) {
  useEffect(() => {
    trackCaseStudyView(slug, practice);
  }, [slug, practice]);

  return null;
}
