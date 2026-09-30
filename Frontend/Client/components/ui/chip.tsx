import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

/** Software chip with the cpu glyph (home "Software & Technologies" row, detail "Software Covered"). */
export function SoftwareChip({
  label,
  size = "md",
  className,
}: {
  label: string;
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <span
      data-tilt
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-sm border border-line bg-elevated/70 font-sans font-semibold text-body leading-native whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-[border-color,translate,box-shadow,color,transform,background-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-primary/50 hover:bg-elevated hover:text-heading hover:shadow-[0_14px_30px_-14px_rgb(255_90_31/0.55)]",
        size === "md" ? "px-5 py-3 text-13" : "px-4 py-2 text-14",
        className,
      )}
    >
      <Cpu className="size-4 shrink-0 text-primary-bright transition-transform duration-400 ease-brand group-hover:rotate-90 group-hover:scale-110" aria-hidden />
      {label}
    </span>
  );
}

/** Tiny software tag used on trainer & project cards. */
export function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "body";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-start rounded-pill border border-line bg-heading/5 px-2 py-1 font-sans font-medium leading-native whitespace-nowrap transition-[background-color,color,border-color] duration-200 hover:border-primary/40 hover:bg-primary-soft hover:text-primary-bright",
        tone === "muted" ? "text-10 text-muted" : "text-11 text-body",
      )}
    >
      {children}
    </span>
  );
}

/** Pill used for career opportunities. */
export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-start rounded-pill border border-primary/40 bg-primary-soft px-4 py-2 font-sans text-13 font-semibold leading-native text-primary-bright whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-[background-color,color,translate,box-shadow,border-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_12px_28px_-12px_rgb(255_90_31/0.7)]">
      {children}
    </span>
  );
}
