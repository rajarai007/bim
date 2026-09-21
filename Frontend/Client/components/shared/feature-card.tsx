import type { Feature } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Icon + title + description card.
 * - `layout="row"` → home "Why Choose Us" (orange icon, 24px padding)
 * - `layout="column"` → About "Key Institutional Strengths" (teal icon, 32px padding)
 */
export function FeatureCard({
  feature,
  layout = "row",
}: {
  feature: Feature;
  layout?: "row" | "column";
}) {
  const Icon = feature.icon;
  const row = layout === "row";
  return (
    <article
      data-spotlight={row ? "" : "accent"}
      data-tilt
      className={cn(
        "card-lift group flex h-full rounded-md bg-surface hover:bg-elevated/80",
        row ? "items-start gap-4 p-6" : "flex-col items-start gap-4 p-8",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-[scale,rotate,box-shadow] duration-400 ease-brand group-hover:-rotate-6 group-hover:scale-110",
          row
            ? "bg-primary-soft text-primary group-hover:shadow-[0_0_0_6px_rgb(255_90_31/0.12)]"
            : "bg-accent-soft text-accent group-hover:shadow-[0_0_0_6px_var(--color-accent-soft)]",
        )}
      >
        <Icon className="size-[18px] transition-transform duration-400 ease-brand group-hover:rotate-6" aria-hidden />
      </span>
      <div className={cn("flex min-w-0 flex-col items-start", row ? "flex-1 gap-2" : "gap-4")}>
        <h3 className="font-heading text-18 font-bold leading-native text-heading">
          {feature.title}
        </h3>
        <p className="font-sans text-13 leading-normal text-muted">{feature.description}</p>
      </div>
    </article>
  );
}
