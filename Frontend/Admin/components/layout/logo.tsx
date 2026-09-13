import { cn } from "@/lib/utils";

/** "B" mark + two-line wordmark. `tone` flips the text colour for light/dark surfaces. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary font-heading text-20 font-black leading-native text-white">
        B
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
