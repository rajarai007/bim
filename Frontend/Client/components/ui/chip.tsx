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
        "group relative inline-flex items-center gap-2 rounded-sm border border-line bg-elevated font-sans font-bold text-body leading-native whitespace-nowrap transition-[border-color,translate,box-shadow,color,transform] duration-300 ease-brand hover:-translate-y-0.5 hover:border-primary/60 hover:text-heading hover:shadow-[0_10px_24px_-12px_rgb(255_90_31/0.5)]",
        size === "md" ? "px-5 py-3 text-13" : "px-4 py-2 text-14",
        className,
      )}
    >
      <Cpu className="size-4 shrink-0 text-primary transition-transform duration-400 ease-brand group-hover:rotate-90 group-hover:scale-110" aria-hidden />
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
        "inline-flex items-start rounded-xs bg-elevated pt-0.5 pr-0.5 pb-1.5 pl-1.5 font-sans leading-native whitespace-nowrap transition-[background-color,color] duration-200 hover:bg-primary-soft hover:text-primary",
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
    <span className="inline-flex items-start rounded-pill border border-primary bg-primary-soft px-4 py-2 font-sans text-13 font-bold leading-native text-primary whitespace-nowrap transition-[background-color,color,translate,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_10px_24px_-12px_rgb(255_90_31/0.6)]">
      {children}
    </span>
  );
}
