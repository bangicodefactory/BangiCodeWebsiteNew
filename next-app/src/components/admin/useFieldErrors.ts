"use client";

import { useState } from "react";
import type { ActionState } from "@/app/admin/actions";

/**
 * Server-side field errors that clear as soon as the author addresses them.
 *
 * Without this, errors from a rejected submit stay on screen while you fix
 * them: you fill in the missing Arabic description, and the field still says
 * "Description is required" until you submit again. Worse, the locale tab keeps
 * its red marker, so the editor cannot tell what is still outstanding — which
 * defeats the point of the per-locale indicators.
 *
 * A field's error is suppressed once its value changes, and the whole set is
 * discarded when a new server response arrives. That reset uses React's
 * "adjusting state during render" pattern (compare the previous prop held in
 * state, set state, let React re-run immediately) rather than a ref — reading
 * or writing a ref during render is a correctness hazard, not just a lint rule.
 */
export function useFieldErrors(state: ActionState) {
  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const [tracked, setTracked] = useState<{
    state: ActionState;
    edited: ReadonlySet<string>;
  }>({ state, edited: new Set() });

  // A fresh response supersedes anything the author edited before it arrived.
  if (tracked.state !== state) {
    setTracked({ state, edited: new Set() });
  }
  const edited = tracked.state === state ? tracked.edited : new Set<string>();

  function errorFor(key: string): string | undefined {
    return edited.has(key) ? undefined : serverErrors[key];
  }

  function noteEdit(key: string): void {
    if (!(key in serverErrors) || edited.has(key)) return;
    setTracked((prev) => ({
      state: prev.state,
      edited: new Set(prev.edited).add(key),
    }));
  }

  /** True when any still-unresolved error belongs to this locale. */
  function localeHasError(locale: string): boolean {
    return Object.keys(serverErrors).some(
      (k) => k.startsWith(`content.${locale}.`) && !edited.has(k),
    );
  }

  return { errorFor, noteEdit, localeHasError };
}
