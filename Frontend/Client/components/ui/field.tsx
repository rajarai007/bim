import type { ComponentProps, ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ChevronDownWide } from "@/components/icons/chevron-down-wide";
import { cn } from "@/lib/utils";

// Focus: the control lifts to white with a brand ring and a soft outer glow.
const controlBase =
  "w-full rounded-sm border bg-surface p-3 font-sans text-14 leading-native text-body placeholder:text-muted transition-[border-color,box-shadow,background-color] duration-300 ease-brand hover:border-muted/40 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgb(255_90_31/0.14),0_12px_28px_-16px_rgb(255_90_31/0.45)] focus-visible:outline-none aria-[invalid=true]:border-primary";

export function Field({
  label,
  htmlFor,
  error,
  children,
  className,
  style,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("group/field flex min-w-0 flex-1 flex-col items-start gap-2", className)} style={style}>
      <label
        htmlFor={htmlFor}
        className="font-sans text-13 font-bold leading-native text-body transition-colors duration-300 ease-brand group-focus-within/field:text-primary"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="font-sans text-12 leading-native text-primary"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
  /** Surface used behind the control — sidebar forms sit on a darker canvas. */
  surface?: "surface" | "canvas" | "elevated";
};

const surfaces = {
  surface: "bg-surface border-line",
  canvas: "bg-canvas border-line",
  elevated: "bg-elevated border-line",
} as const;

export function Input({ invalid, surface = "surface", className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlBase, surfaces[surface], className)}
      {...rest}
    />
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
  surface?: InputProps["surface"];
};

export function Textarea({ invalid, surface = "surface", className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlBase, surfaces[surface], "min-h-[100px] resize-none", className)}
      {...rest}
    />
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  invalid?: boolean;
  surface?: InputProps["surface"];
  placeholder?: string;
  /** Course-detail sidebar uses the wide Figma glyph; everywhere else uses Lucide. */
  chevron?: "lucide" | "wide";
};

export function Select({
  invalid,
  surface = "surface",
  placeholder,
  chevron = "lucide",
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          surfaces[surface],
          "appearance-none pr-9 text-body",
          className,
        )}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      {chevron === "wide" ? (
        <ChevronDownWide
          size={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-body"
        />
      ) : (
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-body"
        />
      )}
    </div>
  );
}

export function Checkbox({
  id,
  label,
  error,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { id: string; label: ReactNode; error?: string }) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="flex w-full cursor-pointer items-center gap-2">
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            className="peer size-4 cursor-pointer appearance-none rounded-xs border border-line bg-surface transition-[border-color,box-shadow] duration-200 checked:border-primary checked:bg-surface checked:shadow-[0_0_0_3px_rgb(255_90_31/0.15)]"
            aria-invalid={error ? true : undefined}
            {...rest}
          />
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute size-2.5 scale-50 opacity-0 transition-[opacity,scale] duration-200 ease-brand peer-checked:scale-100 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M13.3328 4L6.0002 11.3328L2.6672 7.99971" className="text-accent" />
          </svg>
        </span>
        <span className="flex-1 font-sans text-12 leading-native text-muted">{label}</span>
      </label>
      {error ? (
        <p role="alert" className="font-sans text-12 leading-native text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
