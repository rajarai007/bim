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
        "card-lift group flex h-full rounded-lg bg-surface/80",
        row ? "items-start gap-4 p-6" : "flex-col items-start gap-5 p-8",
      )}
    >
      <span className={cn("well well-round size-11 shrink-0")} data-tone={row ? undefined : "accent"}>
        <Icon className="size-[18px] transition-transform duration-400 ease-brand group-hover:rotate-6" aria-hidden />
      </span>
      <div className={cn("flex min-w-0 flex-col items-start", row ? "flex-1 gap-2" : "gap-3")}>
        <h3 className="font-heading text-18 font-semibold leading-native text-heading">
          {feature.title}
        </h3>
        <p className="font-sans text-14 leading-normal text-muted">{feature.description}</p>
      </div>
    </article>
  );
}
