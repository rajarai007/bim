import Image from "next/image";
import type { CSSProperties } from "react";
import { Layers } from "lucide-react";
import { Container } from "@/components/layout/container";
import { HeroScene } from "@/components/motion/hero-scene";
import { SplitWords } from "@/components/motion/split-words";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Decorative viewer-style readouts that float around the model. Purely
 * presentational (aria-hidden), positioned in the hero's right half on
 * desktop; each one sits on its own depth layer so the pointer parallaxes
 * them against the wireframe. Positions ring the model (which the scene keeps
 * right of the copy column); the negative delays offset the float phases so
 * the chips never bob in unison.
 */
const hud = [
  {
    key: "Model",
    value: "LOD 400 · Structural",
    tone: "accent",
    depth: 0.55,
    className: "right-[5%] top-[14%]",
    delay: "0s",
  },
  {
    key: "Clash detection",
    value: "0 conflicts",
    tone: "primary",
    depth: 0.35,
    className: "right-[3%] bottom-[18%]",
    delay: "-2.5s",
  },
  {
    key: "Level 06",
    value: "+21.40 m",
    tone: "accent",
    depth: 0.75,
    className: "left-[55%] top-[66%]",
    delay: "-4.5s",
  },
] as const;

export function Hero() {
  return (
    // `overflow-clip` (not hidden): a scroll container would capture the
    // copy's scroll-driven `view()` timeline instead of the viewport.
    <section className="relative flex w-full items-center overflow-clip xl:min-h-[720px]">
      {/* Far layer: the site photo, washed into the paper and drifting on scroll. */}
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0 opacity-60">
        {/* Oversized so the parallax drift never exposes an edge. */}
        <div data-parallax="0.25" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className="kenburns object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-overlay-hero" />
      </div>

      {/* Mid layer: the live wireframe model. */}
      <HeroScene />

      {/* Near layer: floating readouts (desktop only). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
        {hud.map((chip) => (
          <div key={chip.key} data-depth={chip.depth} className={cn("absolute", chip.className)}>
            <span
              className="glass glass-edge hud hud-float"
              style={{ "--float-delay": chip.delay } as CSSProperties}
            >
              <span className="hud-dot" data-tone={chip.tone} />
              <span className="hud-key">{chip.key}</span>
              <span className="hud-value">{chip.value}</span>
            </span>
          </div>
        ))}
      </div>

      <Container className="relative flex items-center py-16 md:py-20 xl:py-24">
        <div
          data-scroll="recede"
          className="flex w-full max-w-[680px] flex-col items-start gap-6 md:gap-8"
        >
          <div data-reveal="left">
            <Badge>AEC Industry Specialization</Badge>
          </div>
          <h1
            data-reveal="words"
            data-reveal-delay="1"
            className="font-heading text-36 font-black leading-hero text-heading md:text-48 xl:text-56"
          >
            <SplitWords text="Build Your Career in BIM & Design Technology" />
          </h1>
          <p
            data-reveal="up"
            data-reveal-delay="5"
            className="font-sans text-16 leading-body text-body md:text-18"
          >
            {siteConfig.description}
          </p>
          <div
            data-reveal-stagger="up"
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start sm:gap-4 [--stagger-offset:650ms]"
          >
            <Button href={routes.courses} size="lg">
              <Layers className="size-4 transition-transform duration-300 ease-brand group-hover/btn:rotate-12" aria-hidden />
              Explore Courses
            </Button>
            <Button href={routes.contact} variant="outline" size="lg">
              Enquire Now
            </Button>
          </div>
          <div data-reveal="fade" data-reveal-delay="8" className="draw-in mt-2 hidden w-full max-w-[420px] sm:block">
            <div className="dim-line" />
          </div>
        </div>
      </Container>
    </section>
  );
}
