import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge + section title pair used at the top of nearly every section.
 * `align="center"` matches the centered headings on the home page.
 */
export function SectionHeading({
  badge,
  badgeTone = "accent",
  title,
  align = "start",
  as: Heading = "h2",
  className,
}: {
  badge?: string;
  badgeTone?: "accent" | "primary";
  title: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      data-reveal-stagger="up"
      className={cn(
        "flex w-full flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
      <Heading className="font-heading text-28 font-extrabold leading-native text-heading md:text-32 xl:text-36">
        {title}
      </Heading>
      {/* Dimension line draws itself in once the heading has revealed. */}
      <span aria-hidden className="draw-in mt-1 block w-16">
        <span className="dim-line block" />
      </span>
    </div>
  );
}
