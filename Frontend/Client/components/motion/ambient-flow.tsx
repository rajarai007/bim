"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------------ */
/* The air of the studio, behind every page.                                 */
/*                                                                           */
/* Silk ribbons: bundles of fine strands that undulate across the sheet,     */
/* twist over themselves, roll with the scroll and bow away from the         */
/* pointer. Around them, dust motes drift up through the daylight at         */
/* different depths and catch fire near the pointer. No grid, no straight    */
/* lines: only slow, soft curves.                                            */
/*                                                                           */
/* Cheap by design: one rAF loop (30 fps on phones) that starts only after    */
/* the page has loaded and gone idle and pauses when the tab is hidden, DPR  */
/* capped at 1.5 (1 on phones), fewer ribbons and motes on small screens,    */
/* and a single static frame under reduced motion.                           */
/* ------------------------------------------------------------------------ */

const INK = "60 45 20"; // dark ink on the cream sheet
const TEAL = "13 148 136"; // --color-accent
const ORANGE = "255 90 31"; // --color-primary
const AMBER = "245 170 90"; // warm undertone of the ambient light

/** Horizontal sampling step for a strand (px). */
const STEP = 22;
/** Ribbons and motes wrap this far outside the viewport (px). */
const MARGIN = 160;
/** Pointer influence: reach along x / y (px) and how far strands bow (px). */
const BOW_X = 170;
const BOW_Y = 150;
const BOW_PUSH = 44;
/** Motes within this distance of the pointer light up (px). */
const MOTE_REACH = 170;

type Ribbon = {
  /** Resting height as a fraction of the viewport. */
  y: number;
  amp: number;
  /** Wavelengths (px) of the swell, the ripple and the twist. */
  l1: number;
  l2: number;
  l3: number;
  /** Angular speeds (rad/s) of the same three. */
  w1: number;
  w2: number;
  w3: number;
  phase: number;
  strands: number;
  spread: number;
  alpha: number;
  from: string;
  to: string;
  /** Fraction of the scroll the ribbon travels: its depth behind the page. */
  depth: number;
};

const RIBBONS: Ribbon[] = [
  { y: 0.16, amp: 58, l1: 1300, l2: 470, l3: 980, w1: 0.16, w2: 0.23, w3: 0.13, phase: 0.4, strands: 7, spread: 50, alpha: 0.3, from: ORANGE, to: AMBER, depth: 0.1 },
  { y: 0.62, amp: 84, l1: 1100, l2: 540, l3: 1150, w1: 0.12, w2: 0.19, w3: 0.1, phase: 2.1, strands: 8, spread: 68, alpha: 0.26, from: TEAL, to: ORANGE, depth: 0.2 },
  { y: 1.02, amp: 64, l1: 1450, l2: 410, l3: 860, w1: 0.14, w2: 0.26, w3: 0.16, phase: 4.2, strands: 6, spread: 44, alpha: 0.24, from: AMBER, to: TEAL, depth: 0.06 },
  { y: 0.38, amp: 46, l1: 900, l2: 620, l3: 1300, w1: 0.2, w2: 0.15, w3: 0.09, phase: 5.3, strands: 5, spread: 36, alpha: 0.2, from: ORANGE, to: TEAL, depth: 0.28 },
  { y: 0.84, amp: 72, l1: 1200, l2: 500, l3: 1050, w1: 0.1, w2: 0.21, w3: 0.12, phase: 1.2, strands: 6, spread: 56, alpha: 0.22, from: TEAL, to: AMBER, depth: 0.14 },
];

type Mote = { x: number; y: number; z: number; sway: number; phase: number; warm: boolean };

function glowSprite(rgb: string) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgb(${rgb} / 0.9)`);
    grad.addColorStop(0.25, `rgb(${rgb} / 0.35)`);
    grad.addColorStop(1, `rgb(${rgb} / 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

const wrap = (value: number, span: number) => ((value % span) + span) % span;

export function AmbientFlow() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    host.appendChild(canvas);

    const small = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const orangeGlow = glowSprite(ORANGE);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let time = 0;
    let ribbons: Ribbon[] = [];
    let inks: CanvasGradient[] = [];
    let motes: Mote[] = [];
    let ready = false;

    // Pointer: target, eased position and eased strength.
    let tx = -1;
    let ty = -1;
    let mx = 0;
    let my = 0;
    let lens = 0;

    const seed = () => {
      ribbons = small.matches ? RIBBONS.slice(0, 3) : RIBBONS;
      // Each ribbon's ink fades in from the left edge and out at the right.
      inks = ribbons.map((ribbon) => {
        const ink = ctx.createLinearGradient(0, 0, w, 0);
        ink.addColorStop(0, `rgb(${ribbon.from} / 0)`);
        ink.addColorStop(0.22, `rgb(${ribbon.from} / 1)`);
        ink.addColorStop(0.7, `rgb(${ribbon.to} / 1)`);
        ink.addColorStop(1, `rgb(${ribbon.to} / 0)`);
        return ink;
      });
      const count = small.matches ? 16 : Math.min(54, Math.round((w * h) / 30000));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h + MARGIN * 2),
        z: 0.25 + Math.random() * 0.75,
        sway: 8 + Math.random() * 22,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.3,
      }));
    };

    /* ---- Ribbons ------------------------------------------------------------ */
    const drawRibbon = (ribbon: Ribbon, ink: CanvasGradient, scroll: number) => {
      const span = h + MARGIN * 2;
      const y0 = wrap(ribbon.y * h + MARGIN - scroll * ribbon.depth, span) - MARGIN;
      // Scrolling also rolls the wave along, so the page feels geared to it.
      const t = time + scroll * 0.0012;
      const k1 = (Math.PI * 2) / ribbon.l1;
      const k2 = (Math.PI * 2) / ribbon.l2;
      const k3 = (Math.PI * 2) / ribbon.l3;
      const scale = small.matches ? 0.6 : 1;

      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      for (let s = 0; s < ribbon.strands; s++) {
        const u = s / (ribbon.strands - 1) - 0.5;
        ctx.globalAlpha = ribbon.alpha * (1 - Math.abs(u) * 1.1);
        ctx.beginPath();
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          const swell = Math.sin(x * k1 + t * ribbon.w1 + ribbon.phase);
          const ripple = Math.sin(x * k2 - t * ribbon.w2 + ribbon.phase * 1.7);
          // The strands cross where the twist passes through zero.
          const twist = Math.sin(x * k3 + t * ribbon.w3 + ribbon.phase * 0.6 + u * 0.9);
          let y = y0 + (swell * ribbon.amp + ripple * ribbon.amp * 0.4 + u * ribbon.spread * twist) * scale;
          if (lens > 0.01) {
            const dx = x - mx;
            const dy = y - my;
            const near = Math.exp(-(dx * dx) / (2 * BOW_X * BOW_X) - (dy * dy) / (2 * BOW_Y * BOW_Y));
            // Soft sign: a strand crossing the pointer's height parts smoothly.
            y += (dy / Math.sqrt(dy * dy + 48 * 48)) * BOW_PUSH * near * lens;
          }
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    /* ---- Dust motes --------------------------------------------------------- */
    const drawMotes = (dt: number, scroll: number) => {
      const span = h + MARGIN * 2;
      for (const mote of motes) {
        mote.y -= (5 + mote.z * 11) * dt;
        const x = wrap(mote.x + Math.sin(time * 0.35 + mote.phase) * mote.sway, w);
        const y = wrap(mote.y - scroll * mote.z * 0.22, span) - MARGIN;
        const twinkle = 0.65 + 0.35 * Math.sin(time * 1.1 + mote.phase * 3);
        const radius = 0.7 + mote.z * 1.5;

        let heat = 0;
        if (lens > 0.01) {
          const d = Math.hypot(x - mx, y - my);
          if (d < MOTE_REACH) heat = Math.pow(1 - d / MOTE_REACH, 2) * lens;
        }
        if (heat > 0.02 || mote.warm) {
          const glow = mote.warm ? Math.max(heat, 0.35 * twinkle * mote.z) : heat;
          const r = radius * 4 + glow * 9;
          ctx.globalAlpha = Math.min(1, 0.3 + glow);
          ctx.drawImage(orangeGlow, x - r, y - r, r * 2, r * 2);
          ctx.globalAlpha = 1;
        }
        if (!mote.warm) {
          ctx.fillStyle = `rgb(${INK} / ${((0.1 + mote.z * 0.2) * twinkle).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    /* ---- Frame ---------------------------------------------------------------- */
    const draw = (dt: number) => {
      const still = reduce.matches;
      const scroll = still ? 0 : window.scrollY;
      time += dt;

      const target = !still && fine.matches && tx >= 0 ? 1 : 0;
      lens += (target - lens) * Math.min(1, dt * 4);
      if (tx >= 0) {
        mx += (tx - mx) * Math.min(1, dt * 9);
        my += (ty - my) * Math.min(1, dt * 9);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ribbons.length; i++) drawRibbon(ribbons[i], inks[i], scroll);
      drawMotes(dt, scroll);

      if (!ready) {
        // First frame is on screen: let the CSS dissolve the layer in.
        ready = true;
        host.dataset.ready = "";
      }
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      // A phone's URL bar only changes the height: keep the motes where they are.
      const reseed = width !== w;
      w = width;
      h = height;
      dpr = small.matches ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      if (reseed) seed();
    };

    /* ---- Loop -------------------------------------------------------------- */
    let frame = 0;
    let running = false;
    let last = 0;
    /** Set once the page has loaded and gone idle (see the end of this effect); nothing draws before that. */
    let armed = false;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      // Phones run at half rate: everything here moves slowly enough to hide it.
      if (small.matches && now - last < 30) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      draw(dt);
    };
    const start = () => {
      if (running || reduce.matches) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => {
      if (!armed) return;
      if (document.hidden) stop();
      else start();
    };

    /* ---- Inputs ------------------------------------------------------------ */
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (tx < 0) {
        mx = event.clientX;
        my = event.clientY;
      }
      tx = event.clientX;
      ty = event.clientY;
    };
    const onLeave = () => {
      tx = -1;
      ty = -1;
    };
    const onMotionPref = () => {
      if (!armed) return;
      stop();
      if (reduce.matches) draw(0);
      else sync();
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce.matches) draw(0);
    });

    // The layer is decoration that dissolves in on its own, so its first frames wait
    // until the page has loaded and the main thread is idle: drawing never competes
    // with the hero image, hydration or the visitor's first tap.
    let idle = 0;
    const hasIdle = typeof window.requestIdleCallback === "function";
    const arm = () => {
      armed = true;
      resize();
      if (reduce.matches) draw(0); // one calm frame, no loop
      sync();
      ro.observe(host);
    };
    const whenLoaded = () => {
      // Safari has no requestIdleCallback; a short timeout after `load` stands in.
      idle = hasIdle ? window.requestIdleCallback(arm, { timeout: 2000 }) : window.setTimeout(arm, 300);
    };
    if (document.readyState === "complete") whenLoaded();
    else window.addEventListener("load", whenLoaded, { once: true });
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", onMotionPref);

    return () => {
      stop();
      window.removeEventListener("load", whenLoaded);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      reduce.removeEventListener("change", onMotionPref);
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="ambient-flow" aria-hidden />;
}
