"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Client boundary for the hero's canvas scene so the drawing code is split
 * into its own chunk and only ever runs in the browser.
 */
const BlueprintScene = dynamic(
  () => import("@/components/motion/blueprint-scene").then((m) => m.BlueprintScene),
  { ssr: false },
);

/**
 * The scene is decorative and fades in on its own, so it waits until the page
 * has loaded and the main thread is idle: its chunk download and first frames
 * never compete with the hero copy, hydration or the first tap.
 */
export function HeroScene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Safari has no requestIdleCallback; a short timeout after `load` stands in.
    const hasIdle = typeof window.requestIdleCallback === "function";
    let idle = 0;
    const mount = () => {
      if (hasIdle) {
        idle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      } else {
        idle = window.setTimeout(() => setReady(true), 300);
      }
    };
    if (document.readyState === "complete") mount();
    else window.addEventListener("load", mount, { once: true });

    return () => {
      window.removeEventListener("load", mount);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return ready ? <BlueprintScene /> : null;
}
