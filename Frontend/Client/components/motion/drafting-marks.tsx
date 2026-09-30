import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "banner" | "band" | "compact";

/** Three rings spinning on different axes around a glowing core (CSS 3D). */
export function Gyro({ className, size = 180 }: { className?: string; size?: number }) {
  return (
    <div className={cn("gyro", className)} style={{ "--size": `${size}px` } as CSSProperties} aria-hidden>
      <div className="gyro-stage">
        <span className="gyro-ring" />
        <span className="gyro-ring" />
        <span className="gyro-ring" />
        <span className="gyro-core" />
      </div>
    </div>
  );
}

/** Slowly turning wireframe cube (CSS 3D, six faces). */
export function Cube({
  className,
  size = 96,
  tone,
  speed,
  floatDelay,
}: {
  className?: string;
  size?: number;
  tone?: "primary";
  speed?: "slow";
  floatDelay?: string;
}) {
  return (
    <div
      className={cn("cube", floatDelay !== undefined && "cube-float", className)}
      data-tone={tone}
      data-speed={speed}
      style={{ "--size": `${size}px`, "--float-delay": floatDelay } as CSSProperties}
      aria-hidden
    >
      <div className="cube-stage">
        <span className="cube-face" />
        <span className="cube-face" />
        <span className="cube-face" />
        <span className="cube-face" />
        <span className="cube-face" />
        <span className="cube-face" />
      </div>
    </div>
  );
}

/**
 * Decorative drafting layers for full-bleed sections: dimension lines with
 * ticks, a survey point with its glow, a scan line sweeping the band, and 3D
 * ornaments (gyroscope rings and a wireframe cube). Each layer sits at its own
 * depth so the pointer parallaxes them against the copy. Presentational only
 * (aria-hidden), must live inside a `relative overflow-clip` section, and
 * hides its finer layers below `md` so phones only pay for the scan line.
 */
export function DraftingMarks({ variant = "banner", className }: { variant?: Variant; className?: string }) {
  const band = variant === "band";
  const compact = variant === "compact";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Scanner pass */}
      <span className="scanline" style={{ "--scan-travel": band ? "420px" : "360px" } as CSSProperties} />
      {/* Mid: dimension lines + ticks */}
      <div data-depth="0.4" className="absolute inset-0 hidden md:block">
        <span className={cn("dim-line absolute w-[160px]", band ? "top-[26%] right-[12%]" : "top-[22%] right-[10%]")} />
        <span className={cn("dim-line absolute w-[96px]", band ? "bottom-[24%] right-[26%]" : "bottom-[20%] right-[30%]")} />
        <span className="absolute top-[58%] right-[18%] h-[72px] w-px bg-muted/40" />
      </div>
      {/* Mid-near: 3D ornaments */}
      {!compact ? (
        <div data-depth="0.55" className="absolute inset-0 hidden md:block">
          <Gyro className={cn(band ? "top-[8%] right-[6%]" : "top-[10%] right-[7%]")} size={band ? 200 : 170} />
          <Cube
            className={cn(band ? "bottom-[10%] left-[8%]" : "top-[46%] right-[28%]")}
            size={band ? 110 : 84}
            tone={band ? "primary" : undefined}
            speed={band ? "slow" : undefined}
            floatDelay="-4s"
          />
        </div>
      ) : (
        <div data-depth="0.5" className="absolute inset-0 hidden md:block">
          <Cube className="top-[18%] right-[10%]" size={72} floatDelay="-2s" />
        </div>
      )}
      {/* Near: survey point */}
      <div data-depth="0.7" className="absolute inset-0 hidden md:block">
        <span className={cn("survey-point absolute", band ? "top-[40%] right-[20%]" : "top-[36%] right-[16%]")} />
      </div>
    </div>
  );
}
