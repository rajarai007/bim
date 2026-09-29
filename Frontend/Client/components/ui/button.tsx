import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "outline-filled" | "whatsapp";
type Size = "md" | "lg";

// `transform` is in the transition list for the magnetic pull (see Spatial
// system in globals.css); lift uses `translate` and press uses `scale`. The
// visual recipe for each variant lives in globals.css (`.btn-*`) so the
// gradients, inner highlights and glows stay part of the design system.
const base =
  "btn-shine group/btn relative inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold whitespace-nowrap transition-[background-color,border-color,color,translate,scale,box-shadow,transform,filter] duration-300 ease-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:duration-100 disabled:pointer-events-none disabled:opacity-70";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  "outline-filled": "btn-outline-filled",
  whatsapp: "btn-whatsapp",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 py-3 text-15",
  lg: "min-h-[54px] px-8 py-3.5 text-16",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** Drift toward a nearby pointer (desktop only). On by default for filled CTAs. */
  magnetic?: boolean;
  /** Busy state: spinner + continuous light sweep. Pair with `disabled`. */
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
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
    magnetic = variant === "primary" || variant === "whatsapp",
    loading = false,
    className,
    children,
    ...rest
  } = props;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", loading && "btn-loading", className);
  const magnet = magnetic && !fullWidth ? { "data-magnetic": "" } : {};
  const content = (
    <>
      {loading ? <span className="spinner shrink-0" aria-hidden /> : null}
      {children}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    // A file download is a plain anchor: a client-side navigation cannot handle a non-HTML response.
    if ("download" in rest && rest.download !== undefined) {
      return (
        <a className={classes} {...magnet} {...(rest as ComponentPropsWithoutRef<"a">)}>
          {content}
        </a>
      );
    }
    return (
      <Link className={classes} {...magnet} {...(rest as ComponentPropsWithoutRef<typeof Link>)}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as ComponentProps<"button">;
  return (
    <button type={type} className={classes} aria-busy={loading || undefined} {...magnet} {...buttonRest}>
      {content}
    </button>
  );
}
