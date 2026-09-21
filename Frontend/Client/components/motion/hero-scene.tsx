"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the hero's canvas scene so the drawing code is split
 * into its own chunk and only ever runs in the browser.
 */
const BlueprintScene = dynamic(
  () => import("@/components/motion/blueprint-scene").then((m) => m.BlueprintScene),
  { ssr: false },
);

export function HeroScene() {
  return <BlueprintScene />;
}
