import { cn } from "@/lib/utils";

/** Wide check glyph exported from Figma ("What You Will Learn" list). */
export function CheckWide({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path
        d="M17 1L6 17L1 9.72737"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
