import { cn } from "@/lib/utils";

type Variant = "banner" | "band" | "compact";

/**
 * Decorative drafting layers for full-bleed sections: an isometric grid that
 * fades in from one corner, a couple of dimension lines with ticks, and a
 * survey point with its glow. Each layer sits at its own depth so the pointer
 * parallaxes them against the copy. Presentational only (aria-hidden), must
 * live inside a `relative overflow-clip` section, and hides its finer layers
 * below `md` so phones only pay for the grid.
 */
export function DraftingMarks({ variant = "banner", className }: { variant?: Variant; className?: string }) {
  const band = variant === "band";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Far: isometric grid, right-hand side */}
      <div
        data-depth="0.15"
        className={cn(
          "iso-grid absolute inset-y-0 right-0 w-[70%]",
          variant === "compact" ? "opacity-60" : "opacity-100",
        )}
      />
      {/* Mid: dimension lines + ticks */}
      <div data-depth="0.4" className="absolute inset-0 hidden md:block">
        <span className={cn("dim-line absolute w-[160px]", band ? "top-[26%] right-[12%]" : "top-[22%] right-[10%]")} />
        <span className={cn("dim-line absolute w-[96px]", band ? "bottom-[24%] right-[26%]" : "bottom-[20%] right-[30%]")} />
        <span className="absolute top-[58%] right-[18%] h-[72px] w-px bg-muted/40" />
      </div>
      {/* Near: survey point */}
      <div data-depth="0.7" className="absolute inset-0 hidden md:block">
        <span className={cn("survey-point absolute", band ? "top-[40%] right-[20%]" : "top-[36%] right-[16%]")} />
      </div>
    </div>
  );
}
