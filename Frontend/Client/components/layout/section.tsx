import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type Padding = "md" | "lg" | "none";
type Tone = "canvas" | "surface" | "transparent";
type Stagger = "up" | "scale" | "left" | "right" | "fade";

const paddings: Record<Padding, string> = {
  md: "py-12 md:py-16 xl:py-20", // 80px at desktop
  lg: "py-14 md:py-20 xl:py-25", // 100px at desktop
  none: "",
};

const tones: Record<Tone, string> = {
  canvas: "bg-canvas",
  surface: "bg-surface",
  transparent: "",
};

/**
 * Full-bleed section with a background tone and an inner `Container`.
 * `stagger` cascades the container's direct children into view on scroll
 * (see the Motion system in globals.css).
 */
export function Section({
  id,
  padding = "md",
  tone = "canvas",
  stagger,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  padding?: Padding;
  tone?: Tone;
  stagger?: Stagger;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative w-full", tones[tone], paddings[padding], className)}>
      <Container className={containerClassName} data-reveal-stagger={stagger}>
        {children}
      </Container>
    </section>
  );
}
