import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Table primitives matching the Figma tables: slate header strip, 1px row
 * dividers, 16px cell padding. Wrap in `TableScroll` so narrow screens scroll
 * horizontally instead of squashing columns.
 */
export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full overflow-x-auto", className)}>{children}</div>;
}

export function Table({ className, ...rest }: ComponentPropsWithoutRef<"table">) {
  return <table className={cn("w-full border-collapse text-left", className)} {...rest} />;
}

export function Th({ className, align = "left", ...rest }: ComponentPropsWithoutRef<"th"> & { align?: "left" | "center" | "right" }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line bg-page px-2 py-3 font-sans text-12 font-bold leading-native text-body whitespace-nowrap first:pl-4 last:pr-4",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      {...rest}
    />
  );
}

export function Td({ className, align = "left", ...rest }: ComponentPropsWithoutRef<"td"> & { align?: "left" | "center" | "right" }) {
  return (
    <td
      className={cn(
        "border-b border-line px-2 py-3.5 align-middle font-sans text-14 leading-native text-body first:pl-4 last:pr-4",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      {...rest}
    />
  );
}
