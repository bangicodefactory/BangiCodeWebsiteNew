"use client";

import { useEffect, useRef } from "react";

/*
 * Lights the hero grid under the pointer and follows it.
 *
 * Additive by design. The base grid in HeroSection stays a server-rendered CSS
 * background with no JavaScript — that band is the LCP element and the budget
 * is LCP < 2.0s from EU/MENA, so the hero must look finished before this
 * component exists. If this never hydrates, nothing is missing; the grid is
 * simply not lit.
 *
 * Nothing here goes through React state. The pointer handler writes custom
 * properties straight to the node inside a rAF, so a mouse sweep costs one
 * style write per frame instead of a re-render per event. `setState` here would
 * re-render the hero on every pointermove.
 */
export function HeroGridGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // The hero is the pointer target, not this layer: the layer is
    // pointer-events-none and sits behind the content, so it never sees the
    // cursor itself.
    const host = el?.closest("section");
    if (!el || !host) return;

    /*
     * Skip entirely on touch and for reduced motion.
     *
     * `(hover: hover) and (pointer: fine)` is the real test — a phone reports
     * no hover, and a light that follows a finger it cannot track would sit
     * frozen wherever the last tap landed. Checking the viewport width instead
     * would light up a touchscreen laptop and skip a small desktop window.
     */
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canHover.matches || reduced.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function paint() {
      frame = 0;
      el!.style.setProperty("--glow-x", `${x}px`);
      el!.style.setProperty("--glow-y", `${y}px`);
    }

    function onPointerMove(event: PointerEvent) {
      // Ignore coarse pointers that reach a hybrid device through the same
      // listener — a stylus or finger on a laptop with a trackpad.
      if (event.pointerType === "touch") return;
      const rect = host!.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      // Coalesce to one write per frame. pointermove fires far faster than the
      // compositor can use.
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function onPointerEnter(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      // Place the light before fading it in, so it does not appear at the
      // centre and slide to the cursor on the first move.
      onPointerMove(event);
      paint();
      el!.style.setProperty("--glow-strength", "1");
    }

    function onPointerLeave() {
      el!.style.setProperty("--glow-strength", "0");
    }

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerenter", onPointerEnter, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-grid-glow pointer-events-none absolute inset-0 -z-10"
    />
  );
}
