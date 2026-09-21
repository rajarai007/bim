"use client";

import { useEffect, useRef } from "react";

/** Things the reticle treats as clickable (expands to a ring). */
const LINK_SELECTOR = "a, button, summary, label, [role='button'], [role='tab']";
/** Native caret territory: the reticle hides itself. */
const TEXT_SELECTOR = "input, textarea, select, [contenteditable]";

/**
 * Drafting-reticle cursor for fine pointers: an orange dot that sits exactly
 * under the pointer and a crosshair ring that trails it with a little mass.
 * States come from whatever is under the pointer (`data-cursor="view"` on
 * images/cards shows a filled "View" disc). Touch devices and reduced-motion
 * users never see it — `html[data-cursor]` is only set once a fine pointer is
 * confirmed, and that attribute is what hides the native cursor in CSS.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let enabled = false;
    let frame = 0;
    // Pointer position and the ring's eased position.
    let tx = -100;
    let ty = -100;
    let x = -100;
    let y = -100;
    let shown = false;

    const render = () => {
      frame = 0;
      // Exponential ease: the ring lags the pointer by a few frames.
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      el.style.setProperty("--cx", `${x.toFixed(1)}px`);
      el.style.setProperty("--cy", `${y.toFixed(1)}px`);
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const stateFor = (target: Element | null) => {
      if (!target) return "";
      if (target.closest(TEXT_SELECTOR)) return "text";
      const marked = target.closest<HTMLElement>("[data-cursor]");
      if (marked?.dataset.cursor) return marked.dataset.cursor;
      if (target.closest(LINK_SELECTOR)) return "link";
      return "";
    };

    const setState = (target: Element | null) => {
      const state = stateFor(target);
      if (state) el.dataset.state = state;
      else delete el.dataset.state;
    };
    // After a click the page under the pointer may have changed (navigation,
    // filters) without the pointer moving: re-read what is underneath.
    let refresh = 0;
    const refreshState = () => {
      refresh = 0;
      setState(document.elementFromPoint(tx, ty));
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) {
        // First appearance: snap the ring so it doesn't fly in from the corner.
        x = tx;
        y = ty;
        shown = true;
        el.dataset.shown = "";
      }
      setState(event.target as Element | null);
      schedule();
    };
    const onDown = () => {
      el.dataset.pressed = "";
    };
    const onUp = () => {
      delete el.dataset.pressed;
      refreshState();
      if (refresh) window.clearTimeout(refresh);
      refresh = window.setTimeout(refreshState, 900); // after a route transition
    };
    const onLeave = () => {
      shown = false;
      delete el.dataset.shown;
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      root.dataset.cursor = "";
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerup", onUp, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    };
    const disable = () => {
      if (!enabled) return;
      enabled = false;
      delete root.dataset.cursor;
      delete el.dataset.shown;
      delete el.dataset.state;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (refresh) window.clearTimeout(refresh);
      refresh = 0;
    };
    const sync = () => {
      if (fine.matches && !reduce.matches) enable();
      else disable();
    };

    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden>
      <span className="cursor-ring">
        <span className="cursor-label">View</span>
      </span>
      <span className="cursor-dot" />
    </div>
  );
}
