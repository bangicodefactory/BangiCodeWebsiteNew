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
    const node = ref.current;
    // The hero is the pointer target, not this layer: the layer is
    // pointer-events-none and sits behind the content, so it never sees the
    // cursor itself.
    const host = node?.closest("section");
    if (!node || !host) return;

    /*
     * Skip entirely on touch and for reduced motion.
     *
     * `(hover: hover) and (pointer: fine)` is the real test — a phone reports
     * no hover, and a light that follows a finger it cannot track would sit
     * frozen wherever the last tap landed. Checking the viewport width instead
     * would light up a touchscreen laptop and skip a small desktop window.
     *
     * Re-evaluated on change rather than only at mount, so toggling the OS
     * reduced-motion setting or plugging in a mouse takes effect without a
     * reload.
     */
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let x = 0;
    let y = 0;
    let attached = false;

    function paint() {
      frame = 0;
      node!.style.setProperty("--glow-x", `${x}px`);
      node!.style.setProperty("--glow-y", `${y}px`);
      /*
       * Turning the light ON lives here, not in a pointerenter handler.
       *
       * pointerenter does not fire for an element that appears under a
       * STATIONARY cursor — and the hero fills the viewport, so landing on the
       * page with the cursor already over it is the normal case: click a link,
       * arrive, move your hand. With the enter handler owning this, --glow-x
       * tracked correctly while --glow-strength stayed unset, so the effect was
       * silently dead until you left the hero and came back.
       *
       * pointermove fires on entry too, so this covers both paths with one
       * listener.
       */
      node!.style.setProperty("--glow-strength", "1");
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

    function onPointerLeave() {
      node!.style.setProperty("--glow-strength", "0");
    }

    function attach() {
      if (attached) return;
      attached = true;
      host!.addEventListener("pointermove", onPointerMove, { passive: true });
      host!.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    function detach() {
      if (!attached) return;
      attached = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      host!.removeEventListener("pointermove", onPointerMove);
      host!.removeEventListener("pointerleave", onPointerLeave);
      // Leave nothing lit behind when the preference flips mid-session.
      node!.style.setProperty("--glow-strength", "0");
    }

    function sync() {
      if (canHover.matches && !reduced.matches) attach();
      else detach();
    }

    sync();
    canHover.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      canHover.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      detach();
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
