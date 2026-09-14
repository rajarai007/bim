import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "outline-filled" | "whatsapp";
type Size = "md" | "lg";

const base =
  "btn-shine group/btn inline-flex items-center justify-center gap-2 rounded-sm font-sans font-bold whitespace-nowrap transition-[background-color,border-color,color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:duration-100 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-[#ff6b36] hover:shadow-[0_12px_28px_-10px_rgb(255_90_31/0.65)]",
  secondary:
    "bg-elevated text-heading hover:bg-[#dcdce1] hover:shadow-[0_12px_28px_-12px_rgb(15_23_42/0.3)]",
  outline:
    "border border-primary bg-transparent text-primary hover:bg-primary-soft hover:shadow-[0_12px_28px_-14px_rgb(255_90_31/0.5)]",
  "outline-filled":
    "border border-primary bg-elevated text-primary hover:bg-[#dcdce1] hover:shadow-[0_12px_28px_-14px_rgb(255_90_31/0.5)]",
  whatsapp:
    "bg-whatsapp text-white hover:bg-[#2fe072] hover:shadow-[0_12px_28px_-10px_rgb(37_211_102/0.6)]",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-14",
  lg: "px-8 py-3.5 text-15",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    className,
    children,
    ...rest
  } = props;
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
