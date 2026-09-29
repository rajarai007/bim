import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type Padding = "md" | "lg" | "none";
type Tone = "canvas" | "surface" | "transparent";
type Stagger = "up" | "scale" | "left" | "right" | "fade" | "flip";

const paddings: Record<Padding, string> = {
  md: "py-12 md:py-16 xl:py-20", // 80px at desktop
  lg: "py-14 md:py-20 xl:py-25", // 100px at desktop
  none: "",
};

const tones: Record<Tone, string> = {
  canvas: "",
  surface: "sheet", // translucent band with a lit top edge
  transparent: "",
};

/**
 * Full-bleed section with a background tone and an inner `Container`.
 * `stagger` cascades the container's direct children into view on scroll
 * (see the Motion system in globals.css); `rise` lets the whole band settle
 * into place as it scrolls in and `tilt` swings it up out of perspective
 * (both scroll-driven CSS, progressive enhancement).
 */
export function Section({
  id,
  padding = "md",
  tone = "canvas",
  stagger,
  rise,
  tilt,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  padding?: Padding;
  tone?: Tone;
  stagger?: Stagger;
  rise?: boolean;
  tilt?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-scroll={tilt ? "tilt" : rise ? "rise" : undefined}
      className={cn("relative w-full", tones[tone], paddings[padding], className)}
    >
      <Container className={containerClassName} data-reveal-stagger={stagger}>
        {children}
      </Container>
    </section>
  );
}
