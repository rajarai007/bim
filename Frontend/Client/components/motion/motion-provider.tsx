"use client";

import { useEffect } from "react";

/** Elements that animate in when scrolled into view (see globals.css → Motion system). */
const REVEAL_SELECTOR = "[data-reveal], [data-reveal-stagger] > *";

/** Max card pitch/roll under the pointer, in degrees. Believable, not a gimmick. */
const TILT_MAX = 7;
/** How far (px) beyond its own edge a magnetic CTA starts to feel the pointer. */
const MAGNET_REACH = 56;
/** Fraction of the pointer offset a magnetic CTA follows, and its travel cap. */
const MAGNET_PULL = 0.3;
const MAGNET_MAX = 12;
/** Pointer parallax travel (px) for a `data-depth="1"` layer. */
const DEPTH_TRAVEL = 36;

/**
 * Renders nothing. Mounted once in the root layout, it wires up every
 * data-attribute-driven interaction on the page:
 *
 * - `data-reveal` / `data-reveal-stagger` → sets `data-visible` on first
 *   intersection (a MutationObserver picks up nodes added by client navigation
 *   or filtering, so pages never need to register anything).
 * - `data-spotlight` → tracks the pointer as `--mx` / `--my` for the glow.
 * - `data-parallax` → drifts full-bleed backgrounds against the scroll.
 * - `data-tilt` → pitches a card toward the pointer (`--rx` / `--ry`).
 * - `data-magnetic` → pulls a CTA a few px toward a nearby pointer.
 * - `data-depth` → pointer parallax for layered scenes (`--dx` / `--dy`).
 * - `--lx` / `--ly` on `.ambient` → where the ambient light leans.
 *
 * Pointer-driven effects (tilt, magnetic, depth, light) only run for fine
 * pointers with motion allowed; touch devices keep the static depth.
 *
 * Because it mutates DOM nodes as soon as they appear, page content must be
 * part of the initial HTML (no `loading.tsx` / Suspense-streamed sections):
 * nodes streamed in later would be stamped before React hydrates them and
 * trigger hydration-mismatch warnings.
 */
export function MotionProvider() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = "ready";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointerFx = () => finePointer.matches && !reduceMotion.matches;

    /* ---- Scroll reveal ------------------------------------------------- */
    const seen = new WeakSet<Element>();
    const pending = new Set<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      el.dataset.visible = "";
      io.unobserve(el);
      pending.delete(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Reveal when entering the viewport, or immediately if the element
          // is already above it (e.g. reload with restored scroll position).
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            reveal(entry.target as HTMLElement);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const observeNew = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        pending.add(el);
        io.observe(el);
      });
    };

    // The observer's bottom margin can never be crossed by elements sitting in
    // the last 8% of a page (footer bar, short pages on tall screens), so once
    // the document is scrolled to its end, reveal whatever is on screen.
    const revealAtPageEnd = () => {
      const vh = window.innerHeight;
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 2;
      if (!atEnd) return;
      for (const el of pending) {
        if (el.getBoundingClientRect().top < vh) reveal(el);
      }
    };

    /* ---- Element registries (refreshed by the MutationObserver) -------- */
    let parallaxEls: HTMLElement[] = [];
    let magneticEls: HTMLElement[] = [];
    let depthEls: HTMLElement[] = [];
    let ambientEl: HTMLElement | null = null;
    const collect = () => {
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
      magneticEls = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      depthEls = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
      ambientEl = document.querySelector<HTMLElement>(".ambient");
    };

    /* ---- Pointer state --------------------------------------------------- */
    let px = -1;
    let py = -1;
    let pointerDirty = false;
    let tiltEl: HTMLElement | null = null;
    const activeMagnets = new Set<HTMLElement>();

    const resetTilt = () => {
      if (!tiltEl) return;
      tiltEl.style.setProperty("--rx", "0deg");
      tiltEl.style.setProperty("--ry", "0deg");
      delete tiltEl.dataset.tilting;
      tiltEl = null;
    };
    const releaseMagnet = (el: HTMLElement) => {
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
      delete el.dataset.magnetActive;
      activeMagnets.delete(el);
    };
    const releaseAll = () => {
      resetTilt();
      for (const el of activeMagnets) releaseMagnet(el);
      for (const el of depthEls) {
        el.style.setProperty("--dx", "0px");
        el.style.setProperty("--dy", "0px");
      }
    };

    /* ---- Frame ----------------------------------------------------------- */
    let frame = 0;
    const tick = () => {
      frame = 0;
      revealAtPageEnd();
      if (reduceMotion.matches) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Scroll parallax for full-bleed backgrounds.
      for (const el of parallaxEls) {
        // Measure the positioned host (the section), not the moving layer.
        const host = (el.offsetParent as HTMLElement | null) ?? el;
        const rect = host.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) continue;
        const speed = Number(el.dataset.parallax) || 0.2;
        const center = rect.top + rect.height / 2;
        const limit = rect.height * 0.2;
        const offset = Math.max(-limit, Math.min(limit, (vh / 2 - center) * speed));
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }

      if (!pointerDirty || !finePointer.matches || px < 0) return;
      pointerDirty = false;

      // Ambient light leans toward the pointer. Written on the layer itself:
      // a custom property on <html> would restyle the whole document.
      if (ambientEl) {
        ambientEl.style.setProperty("--lx", `${((px / vw) * 100).toFixed(1)}%`);
        ambientEl.style.setProperty("--ly", `${((py / vh) * 100).toFixed(1)}%`);
      }

      // Pointer parallax: layers move by their depth, away from the pointer.
      const nx = px / vw - 0.5;
      const ny = py / vh - 0.5;
      for (const el of depthEls) {
        const depth = Number(el.dataset.depth) || 0.3;
        el.style.setProperty("--dx", `${(-nx * depth * DEPTH_TRAVEL).toFixed(1)}px`);
        el.style.setProperty("--dy", `${(-ny * depth * DEPTH_TRAVEL).toFixed(1)}px`);
      }

      // Magnetic CTAs: anything within reach drifts toward the pointer.
      for (const el of magneticEls) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -MAGNET_REACH || rect.top > vh + MAGNET_REACH) {
          if (activeMagnets.has(el)) releaseMagnet(el);
          continue;
        }
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        // Distance from the pointer to the button's edge (0 while over it).
        const ex = Math.max(0, Math.abs(dx) - rect.width / 2);
        const ey = Math.max(0, Math.abs(dy) - rect.height / 2);
        const edgeDist = Math.hypot(ex, ey);
        if (edgeDist > MAGNET_REACH) {
          if (activeMagnets.has(el)) releaseMagnet(el);
          continue;
        }
        const strength = 1 - edgeDist / MAGNET_REACH; // 1 over the button → 0 at reach
        const eased = strength * strength * (3 - 2 * strength); // smoothstep
        const mx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * MAGNET_PULL * eased));
        const my = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * MAGNET_PULL * eased));
        el.style.setProperty("--mag-x", `${mx.toFixed(1)}px`);
        el.style.setProperty("--mag-y", `${my.toFixed(1)}px`);
        if (!activeMagnets.has(el)) {
          el.dataset.magnetActive = "";
          activeMagnets.add(el);
        }
      }
    };
    const requestTick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    /* ---- Pointer ------------------------------------------------------- */
    const onPointerMove = (event: PointerEvent) => {
      px = event.clientX;
      py = event.clientY;
      pointerDirty = true;
      const target = event.target as Element | null;

      // Cursor spotlight on cards.
      const spot = target?.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        spot.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }

      if (pointerFx()) {
        // Tilt the card under the pointer; ease the previous one back.
        const next = target?.closest<HTMLElement>("[data-tilt]") ?? null;
        if (next !== tiltEl) {
          resetTilt();
          tiltEl = next;
          if (tiltEl) tiltEl.dataset.tilting = "";
        }
        if (tiltEl) {
          const rect = tiltEl.getBoundingClientRect();
          const rx = -((event.clientY - rect.top) / rect.height - 0.5) * 2 * TILT_MAX;
          const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * TILT_MAX;
          tiltEl.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
          tiltEl.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        }
        requestTick();
      }
    };
    const onPointerLeave = () => {
      px = -1;
      py = -1;
      releaseAll();
    };

    /* ---- Wire up ------------------------------------------------------- */
    observeNew();
    collect();
    requestTick();

    // Client-side navigation and filtered lists insert new nodes after mount.
    const mo = new MutationObserver(() => {
      observeNew();
      collect();
      requestTick();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    reduceMotion.addEventListener("change", releaseAll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      reduceMotion.removeEventListener("change", releaseAll);
      if (frame) cancelAnimationFrame(frame);
      releaseAll();
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
