import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "primary";

const tones: Record<Tone, string> = {
  accent: "border-accent bg-accent-soft text-accent",
  primary: "border-primary bg-primary-soft text-primary",
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
        "inline-flex items-start rounded-xs border px-2.5 py-1 font-sans font-bold uppercase leading-native whitespace-nowrap",
        size === "md" ? "text-11" : "text-10",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
