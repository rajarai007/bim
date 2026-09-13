import { cn } from "@/lib/utils";

/**
 * Wide ">" glyph exported from Figma (breadcrumbs, "View Details" links).
 * Path data is the exact Figma vector; colour follows `currentColor`.
 */
export function ChevronWide({
  size = 12,
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
      viewBox="0 0 14 14"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path
        d="M1 13L13 7L1 1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
