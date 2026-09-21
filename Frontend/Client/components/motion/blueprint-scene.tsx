"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------------ */
/* A wireframe BIM model drawn as ink on the drafting sheet.                 */
/*                                                                           */
/* Pure Canvas 2D with a tiny hand-rolled 3D pipeline (yaw → pitch →         */
/* perspective). Two towers of floor plates and columns, curtain-wall        */
/* mullions, a section-cut plane that sweeps through the structure, survey   */
/* points drifting around it, and a perspective ground grid. The camera      */
/* orbits slowly, leans with the pointer, and rises as the hero scrolls out. */
/*                                                                           */
/* Cheap by design: one rAF loop that pauses when the hero is off-screen or  */
/* the tab is hidden, DPR capped at 1.5 (1 on phones), fewer particles on    */
/* small screens, and a single static frame under reduced motion.            */
/* ------------------------------------------------------------------------ */

type P3 = [number, number, number];
type Kind = "plate" | "column" | "mullion" | "roof" | "core" | "grid";
type Seg = { a: P3; b: P3; kind: Kind };

const INK = "15 23 42"; // --color-heading
const TEAL = "10 158 138"; // --color-accent
const ORANGE = "255 90 31"; // --color-primary

const FLOOR_H = 0.17;

function tower(x0: number, z0: number, w: number, d: number, floors: number, bays: number, segs: Seg[], nodes: P3[]) {
  const x1 = x0 + w;
  const z1 = z0 + d;
  const top = floors * FLOOR_H;
  // Corner columns run the full height.
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ] as const) {
    segs.push({ a: [x, 0, z], b: [x, top, z], kind: "column" });
  }
  // Floor plates.
  for (let f = 0; f <= floors; f++) {
    const y = f * FLOOR_H;
    const kind: Kind = f === floors ? "roof" : "plate";
    segs.push({ a: [x0, y, z0], b: [x1, y, z0], kind });
    segs.push({ a: [x1, y, z0], b: [x1, y, z1], kind });
    segs.push({ a: [x1, y, z1], b: [x0, y, z1], kind });
    segs.push({ a: [x0, y, z1], b: [x0, y, z0], kind });
    if (f > 0 && f < floors && f % 3 === 0) {
      nodes.push([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]);
    }
  }
  // Curtain-wall mullions on the two facades that face the camera most.
  for (let i = 1; i < bays; i++) {
    const t = i / bays;
    segs.push({ a: [x0 + w * t, 0, z1], b: [x0 + w * t, top, z1], kind: "mullion" });
    segs.push({ a: [x1, 0, z0 + d * t], b: [x1, top, z0 + d * t], kind: "mullion" });
  }
  // Service core: a slimmer shaft through the middle, drawn lighter.
  const cw = w * 0.34;
  const cd = d * 0.34;
  const cx0 = x0 + (w - cw) / 2;
  const cz0 = z0 + (d - cd) / 2;
  for (const [x, z] of [
    [cx0, cz0],
    [cx0 + cw, cz0],
    [cx0 + cw, cz0 + cd],
    [cx0, cz0 + cd],
  ] as const) {
    segs.push({ a: [x, 0, z], b: [x, top + FLOOR_H * 0.6, z], kind: "core" });
  }
  const ct = top + FLOOR_H * 0.6;
  segs.push({ a: [cx0, ct, cz0], b: [cx0 + cw, ct, cz0], kind: "core" });
  segs.push({ a: [cx0 + cw, ct, cz0], b: [cx0 + cw, ct, cz0 + cd], kind: "core" });
  segs.push({ a: [cx0 + cw, ct, cz0 + cd], b: [cx0, ct, cz0 + cd], kind: "core" });
  segs.push({ a: [cx0, ct, cz0 + cd], b: [cx0, ct, cz0], kind: "core" });
  return { x0, x1, z0, z1, top };
}

function buildModel() {
  const segs: Seg[] = [];
  const nodes: P3[] = [];
  const a = tower(-0.55, -0.4, 1.1, 0.8, 9, 6, segs, nodes);
  tower(0.72, 0.05, 0.62, 0.55, 5, 4, segs, nodes);
  // Ground grid under everything.
  const R = 2.4;
  const STEP = 0.4;
  for (let i = -R; i <= R + 1e-6; i += STEP) {
    segs.push({ a: [i, 0, -R], b: [i, 0, R], kind: "grid" });
    segs.push({ a: [-R, 0, i], b: [R, 0, i], kind: "grid" });
  }
  return { segs, nodes, main: a, center: [0.2, 0.62, 0.05] as P3 };
}

function glowSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = 48;
  c.height = 48;
  const g = c.getContext("2d");
  if (!g) return c;
  const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  grad.addColorStop(0, `rgb(${rgb} / 0.9)`);
  grad.addColorStop(0.25, `rgb(${rgb} / 0.35)`);
  grad.addColorStop(1, `rgb(${rgb} / 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 48, 48);
  return c;
}

/** Deterministic pseudo-random so the particle field is stable across frames/mounts. */
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function BlueprintScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const small = window.matchMedia("(max-width: 767px)");

    const model = buildModel();
    const orangeGlow = glowSprite(ORANGE);
    const tealGlow = glowSprite(TEAL);

    /* ---- Particles (survey points) ------------------------------------- */
    const seed = () => {
      const rand = mulberry32(7);
      const count = small.matches ? 36 : 96;
      return Array.from({ length: count }, (_, i) => ({
        p: [rand() * 4 - 1.7, rand() * 2.2, rand() * 2.4 - 1.2] as P3,
        v: [(rand() - 0.5) * 0.05, (rand() - 0.5) * 0.03, (rand() - 0.5) * 0.05] as P3,
        warm: i % 7 === 0,
      }));
    };
    let parts = seed();

    /* ---- Camera state ---------------------------------------------------- */
    let w = 0;
    let h = 0;
    let dpr = 1;
    let yawPointer = 0; // -1..1 from pointer
    let pitchPointer = 0;
    let yawEased = 0;
    let pitchEased = 0;
    let running = false;
    let visible = true;
    let frame = 0;
    let last = 0;
    let t = 0; // seconds of animation time
    let ready = false;
    /** Matches --follow-mid (400ms) so the model leans in step with the depth layers. */
    const FOLLOW = 0.4;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, small.matches ? 1 : 1.5);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ---- Projection ---------------------------------------------------- */
    const project = (p: P3, yaw: number, pitch: number, unit: number, cx: number, cy: number, out: number[]) => {
      const x = p[0] - model.center[0];
      const y = p[1] - model.center[1];
      const z = p[2] - model.center[2];
      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const x1 = x * cyaw - z * syaw;
      const z1 = x * syaw + z * cyaw;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const f = 5.2; // long lens: closer to an axonometric drawing than a fisheye
      const s = f / (f + z2);
      out[0] = cx + x1 * s * unit;
      out[1] = cy - y2 * s * unit;
      out[2] = z2; // depth: negative = nearer
      out[3] = s;
    };

    const A: number[] = [0, 0, 0, 0];
    const B: number[] = [0, 0, 0, 0];

    const draw = (dt: number) => {
      t += dt;
      // Ease the pointer influence with a fixed time constant so the model
      // has the same inertia as the HUD depth layers.
      const k = 1 - Math.exp(-dt / FOLLOW);
      yawEased += (yawPointer - yawEased) * k;
      pitchEased += (pitchPointer - pitchEased) * k;
      // 0 → hero at top, 1 → hero scrolled out (one layout read per frame,
      // before any writes).
      const rect = host.getBoundingClientRect();
      const scroll = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));

      const wide = w >= 1280;
      const unit = Math.min(w * (wide ? 0.2 : 0.3), h * 0.36);
      // Desktop: keep the model clear of the copy column (Container is centred,
      // max 1440px, 80px gutter, copy is 680px wide). Phones: park it high and
      // to the right so it sits behind the badge/heading, not the paragraph.
      const copyRight = (w - Math.min(w, 1440)) / 2 + 80 + 680;
      const cx = wide
        ? Math.min(Math.max(w * 0.72, copyRight + unit * 1.15), w - unit * 1.15)
        : w * 0.72;
      const cy = (wide ? h * 0.56 : h * 0.3) - scroll * h * 0.18;
      const yaw = -0.55 + t * 0.09 + yawEased * 0.32;
      const pitch = 0.4 + pitchEased * 0.09 + scroll * 0.3;
      const fade = 1 - scroll * 0.85;
      const mobileMute = wide ? 1 : 0.42; // copy sits on top of the model on phones

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      /* Ground grid + structure: batched by kind so we set style once per kind. */
      const kinds: Kind[] = ["grid", "core", "mullion", "plate", "column", "roof"];
      for (const kind of kinds) {
        for (const seg of model.segs) {
          if (seg.kind !== kind) continue;
          project(seg.a, yaw, pitch, unit, cx, cy, A);
          project(seg.b, yaw, pitch, unit, cx, cy, B);
          const depth = (A[2] + B[2]) / 2; // ≈ -1.6 … 1.6
          const near = Math.max(0, Math.min(1, 0.5 - depth * 0.28));
          let alpha: number;
          let width: number;
          let rgb = INK;
          switch (kind) {
            case "grid": {
              // Grid fades with distance from the model's footprint.
              alpha = 0.04 + near * 0.08;
              width = 1;
              break;
            }
            case "core":
              alpha = 0.06 + near * 0.08;
              width = 1;
              break;
            case "mullion":
              alpha = 0.07 + near * 0.12;
              width = 1;
              break;
            case "plate":
              alpha = 0.16 + near * 0.26;
              width = 1;
              break;
            case "column":
              alpha = 0.3 + near * 0.4;
              width = 1.4;
              rgb = TEAL;
              break;
            default: // roof
              alpha = 0.35 + near * 0.35;
              width = 1.4;
              rgb = ORANGE;
          }
          ctx.strokeStyle = `rgb(${rgb} / ${(alpha * fade * mobileMute).toFixed(3)})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(B[0], B[1]);
          ctx.stroke();
        }
      }

      /* Section-cut plane sweeping through the main tower. */
      const m = model.main;
      const level = 0.25 + ((Math.sin(t * 0.35) + 1) / 2) * (m.top - 0.5);
      const pad = 0.12;
      const corners: P3[] = [
        [m.x0 - pad, level, m.z0 - pad],
        [m.x1 + pad, level, m.z0 - pad],
        [m.x1 + pad, level, m.z1 + pad],
        [m.x0 - pad, level, m.z1 + pad],
      ];
      ctx.beginPath();
      corners.forEach((c, i) => {
        project(c, yaw, pitch, unit, cx, cy, A);
        if (i === 0) ctx.moveTo(A[0], A[1]);
        else ctx.lineTo(A[0], A[1]);
      });
      ctx.closePath();
      ctx.fillStyle = `rgb(${TEAL} / ${(0.07 * fade * mobileMute).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `rgb(${TEAL} / ${(0.55 * fade * mobileMute).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Where the plane cuts the columns: hot orange intersection points.
      for (const [x, z] of [
        [m.x0, m.z0],
        [m.x1, m.z0],
        [m.x1, m.z1],
        [m.x0, m.z1],
      ] as const) {
        project([x, level, z], yaw, pitch, unit, cx, cy, A);
        const r = 14 * A[3];
        ctx.globalAlpha = 0.9 * fade * mobileMute;
        ctx.drawImage(orangeGlow, A[0] - r, A[1] - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
      }

      /* Structural nodes: quiet teal points on every third floor. */
      for (const n of model.nodes) {
        project(n, yaw, pitch, unit, cx, cy, A);
        const r = 7 * A[3];
        ctx.globalAlpha = 0.55 * fade * mobileMute;
        ctx.drawImage(tealGlow, A[0] - r, A[1] - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      /* Survey points: drift, wrap, connect when close. */
      const LINK = 0.5;
      const pts: number[][] = [];
      for (const pt of parts) {
        pt.p[0] += pt.v[0] * dt;
        pt.p[1] += pt.v[1] * dt;
        pt.p[2] += pt.v[2] * dt;
        if (pt.p[0] < -1.7) pt.p[0] += 4;
        if (pt.p[0] > 2.3) pt.p[0] -= 4;
        if (pt.p[1] < 0) pt.p[1] += 2.2;
        if (pt.p[1] > 2.2) pt.p[1] -= 2.2;
        if (pt.p[2] < -1.2) pt.p[2] += 2.4;
        if (pt.p[2] > 1.2) pt.p[2] -= 2.4;
        const out: number[] = [0, 0, 0, 0];
        project(pt.p, yaw, pitch, unit, cx, cy, out);
        pts.push(out);
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i].p;
          const b = parts[j].p;
          const dx = a[0] - b[0];
          const dy = a[1] - b[1];
          const dz = a[2] - b[2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > LINK * LINK) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / LINK) * 0.16 * fade * mobileMute;
          ctx.strokeStyle = `rgb(${INK} / ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
      }
      for (let i = 0; i < parts.length; i++) {
        const o = pts[i];
        const near = Math.max(0, Math.min(1, 0.5 - o[2] * 0.28));
        if (parts[i].warm) {
          const r = 9 * o[3];
          ctx.globalAlpha = (0.5 + near * 0.4) * fade * mobileMute;
          ctx.drawImage(orangeGlow, o[0] - r, o[1] - r, r * 2, r * 2);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = `rgb(${INK} / ${((0.18 + near * 0.3) * fade * mobileMute).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(o[0], o[1], 1.1 + near * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!ready) {
        // First frame is on screen: let the CSS dissolve the layer in.
        ready = true;
        host.dataset.ready = "";
      }
    };

    /* ---- Loop -------------------------------------------------------------- */
    const loop = (now: number) => {
      frame = 0;
      if (!running) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      draw(dt);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce.matches) return;
      running = true;
      last = 0;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    /* ---- Inputs ------------------------------------------------------------ */
    const onPointer = (event: PointerEvent) => {
      if (!fine.matches) return;
      yawPointer = (event.clientX / window.innerWidth - 0.5) * 2;
      pitchPointer = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onBreakpoint = () => {
      parts = seed();
      resize();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce.matches) draw(0);
    });

    resize();
    if (reduce.matches) draw(0); // one calm frame, no loop
    io.observe(host);
    ro.observe(host);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("pointermove", onPointer, { passive: true });
    small.addEventListener("change", onBreakpoint);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointermove", onPointer);
      small.removeEventListener("change", onBreakpoint);
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="hero-scene" aria-hidden />;
}
