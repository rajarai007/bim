import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White panel with the 1px slate border and 12px radius used throughout the admin. */
export function Card({
  className,
  children,
  shadow = false,
  id,
}: {
  className?: string;
  children: ReactNode;
  shadow?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-lg border border-line bg-card", shadow && "shadow-card", className)}>
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  size = "md",
  className,
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-16 font-bold", md: "text-16 font-extrabold", lg: "text-18 font-extrabold" };
  return (
    <h2 className={cn("font-heading leading-native text-ink whitespace-nowrap", sizes[size], className)}>
      {children}
    </h2>
  );
}
