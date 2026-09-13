import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Centers content to the 1440px Figma frame and applies the responsive
 * horizontal gutter (80px at desktop, scaling down on smaller screens).
 * Extra props (e.g. `data-reveal-stagger`) are forwarded to the element.
 */
export function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-page px-5 md:px-8 lg:px-12 xl:px-gutter", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
