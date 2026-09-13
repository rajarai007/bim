"use client";

import { useEffect } from "react";

/** Elements that animate in when scrolled into view (see globals.css → Motion system). */
const REVEAL_SELECTOR = "[data-reveal], [data-reveal-stagger] > *";

/**
 * Renders nothing. Mounted once in the root layout, it wires up every
 * data-attribute-driven interaction on the page:
 *
 * - `data-reveal` / `data-reveal-stagger` → sets `data-visible` on first
 *   intersection (a MutationObserver picks up nodes added by client navigation
 *   or filtering, so pages never need to register anything).
 * - `data-spotlight` → tracks the pointer as `--mx` / `--my` for the glow.
 * - `data-parallax` → drifts full-bleed backgrounds against the scroll.
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

    /* ---- Parallax ------------------------------------------------------ */
    let parallaxEls: HTMLElement[] = [];
    const collectParallax = () => {
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    };

    let frame = 0;
    const tick = () => {
      frame = 0;
      revealAtPageEnd();
      if (reduceMotion.matches) return;
      const vh = window.innerHeight;
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
    };
    const requestTick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    /* ---- Cursor spotlight ---------------------------------------------- */
    const onPointerMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-spotlight]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    /* ---- Wire up ------------------------------------------------------- */
    observeNew();
    collectParallax();
    requestTick();

    // Client-side navigation and filtered lists insert new nodes after mount.
    const mo = new MutationObserver(() => {
      observeNew();
      collectParallax();
      requestTick();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      document.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
