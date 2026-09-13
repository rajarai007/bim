import Link from "next/link";
import { ChevronWide } from "@/components/icons/chevron-wide";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb trail. Figma uses two chevron glyphs: the wide custom vector on
 * course pages and Lucide's chevron-right elsewhere — `glyph` selects which.
 */
export function Breadcrumb({
  items,
  glyph = "lucide",
  className,
}: {
  items: Crumb[];
  glyph?: "lucide" | "wide";
  className?: string;
}) {
  const Chevron =
    glyph === "wide"
      ? ({ className: c }: { className?: string }) => <ChevronWide size={12} className={c} />
      : ({ className: c }: { className?: string }) => (
          <ChevronRight className={cn("size-3", c)} aria-hidden />
        );

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "font-sans text-14 leading-native whitespace-nowrap",
                    isLast ? "font-bold text-primary" : "font-medium text-muted",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-sans text-14 font-medium leading-native text-muted whitespace-nowrap transition-colors hover:text-body"
                >
                  {item.label}
                </Link>
              )}
              {!isLast ? <Chevron className="text-muted" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
