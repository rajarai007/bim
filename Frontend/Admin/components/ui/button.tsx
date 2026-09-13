import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-sans font-bold whitespace-nowrap transition-[background-color,border-color,color] duration-150 ease-brand disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-[#ff6b36]",
  outline: "border border-line bg-card text-body hover:bg-page",
  ghost: "bg-page text-body hover:bg-line/60",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-13",
  md: "px-5 py-2.5 text-14",
  lg: "px-6 py-2.5 text-14",
};

type Common = { variant?: Variant; size?: Size; fullWidth?: boolean; className?: string; children: ReactNode };
type AsButton = Common & Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };
type AsLink = Common & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children"> & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", fullWidth, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ComponentPropsWithoutRef<typeof Link>)}>
        {children}
      </Link>
    );
  }
  const { type = "button", ...buttonRest } = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
