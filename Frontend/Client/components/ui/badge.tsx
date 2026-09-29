import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "primary";

// Tinted glass pills with a lit top edge; the tone only changes the ink.
const tones: Record<Tone, string> = {
  accent: "border-accent/35 bg-accent-soft text-accent",
  primary: "border-primary/40 bg-primary-soft text-primary-bright",
};

export function Badge({
  tone = "accent",
  size = "md",
  className,
  children,
}: {
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1 font-sans font-semibold uppercase tracking-[0.08em] leading-native whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
        size === "md" ? "text-11" : "text-10",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
