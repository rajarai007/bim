import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand assets (transparent PNGs cut from the supplied logo). */
export const brand = {
  mark: "/images/brand/logo-mark.png",
  full: "/images/brand/logo-full.png",
} as const;

/**
 * Brand lockup.
 *  - `compact` (default): "B" emblem + two-line wordmark; `tone` flips the text colour
 *    for light/dark surfaces.
 *  - `full`: the complete logo on a dark tile — its wordmark is white, so it needs a
 *    dark backing on light surfaces such as the login card.
 */
export function Logo({
  tone = "dark",
  variant = "compact",
  className,
}: {
  tone?: "dark" | "light";
  variant?: "compact" | "full";
  className?: string;
}) {
  if (variant === "full") {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-lg bg-ink px-6 py-4", className)}>
        <Image src={brand.full} alt="BIM Career Academy" width={1000} height={845} sizes="200px" priority className="h-auto w-[200px]" />
      </span>
    );
  }
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="relative size-9 shrink-0">
        <Image src={brand.mark} alt="" fill sizes="36px" className="object-contain" />
      </span>
      <span className="flex flex-col items-start gap-0.5 leading-native whitespace-nowrap">
        <span className={cn("font-heading text-15 font-extrabold", tone === "dark" ? "text-white" : "text-ink")}>
          BIM CAREER
        </span>
        <span className="font-sans text-9 font-bold text-teal">ACADEMY</span>
      </span>
    </span>
  );
}
