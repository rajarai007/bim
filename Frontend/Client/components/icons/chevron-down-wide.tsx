import { cn } from "@/lib/utils";

/** Wide "v" glyph exported from Figma (select controls, syllabus modules). */
export function ChevronDownWide({
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
        d="M1 1L9 17L17 1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
