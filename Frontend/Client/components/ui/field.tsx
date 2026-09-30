import type { ComponentProps, ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ChevronDownWide } from "@/components/icons/chevron-down-wide";
import { cn } from "@/lib/utils";

// The control recipe (paper glass, brand focus ring + glow, invalid state) is
// `.control` in globals.css; `data-surface` picks the fill for the surface the
// form sits on.
const controlBase = "control";

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
        className="font-sans text-13 font-semibold leading-native text-body transition-colors duration-300 ease-brand group-focus-within/field:text-primary-bright"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-center gap-1.5 font-sans text-12 leading-native text-primary-bright"
        >
          <span aria-hidden className="inline-block size-1 rounded-full bg-primary-bright shadow-[0_0_8px_rgb(255_90_31/0.9)]" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Surface = "surface" | "canvas" | "elevated";

type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
  /** Surface the control sits on (sidebar / modal forms use a slightly different fill). */
  surface?: Surface;
};

export function Input({ invalid, surface = "surface", className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      data-surface={surface}
      className={cn(controlBase, className)}
      {...rest}
    />
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
  surface?: Surface;
};

export function Textarea({ invalid, surface = "surface", className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      data-surface={surface}
      className={cn(controlBase, "min-h-[110px] resize-none", className)}
      {...rest}
    />
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  invalid?: boolean;
  surface?: Surface;
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
    <div className="group/select relative w-full">
      <select
        aria-invalid={invalid || undefined}
        data-surface={surface}
        className={cn(controlBase, "appearance-none pr-10", className)}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      {chevron === "wide" ? (
        <ChevronDownWide
          size={16}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within/select:text-primary-bright"
        />
      ) : (
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within/select:text-primary-bright"
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
      <label htmlFor={id} className="flex w-full cursor-pointer items-center gap-2.5">
        <span className="relative flex size-[18px] shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            className="peer size-[18px] cursor-pointer appearance-none rounded-xs border border-line-strong bg-heading/5 transition-[border-color,box-shadow,background-color] duration-200 checked:border-primary checked:bg-primary-soft checked:shadow-[0_0_0_3px_rgb(255_90_31/0.18)] focus-visible:shadow-[0_0_0_3px_rgb(13_148_136/0.35)]"
            aria-invalid={error ? true : undefined}
            {...rest}
          />
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute size-3 scale-50 opacity-0 transition-[opacity,scale] duration-200 ease-brand peer-checked:scale-100 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <path d="M13.3328 4L6.0002 11.3328L2.6672 7.99971" className="text-primary-bright" />
          </svg>
        </span>
        <span className="flex-1 font-sans text-12 leading-compact text-muted">{label}</span>
      </label>
      {error ? (
        <p role="alert" className="font-sans text-12 leading-native text-primary-bright">
          {error}
        </p>
      ) : null}
    </div>
  );
}
