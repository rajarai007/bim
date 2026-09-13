import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-sm border border-line bg-page px-4 py-2.5 font-sans text-14 leading-native text-ink placeholder:text-muted transition-colors focus:border-primary focus-visible:outline-none disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col items-start gap-2", className)}>
      <label htmlFor={htmlFor} className="font-sans text-13 font-bold leading-native text-body">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="font-sans text-12 leading-native text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="font-sans text-11 leading-native text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(control, "truncate", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(control, "min-h-[100px] resize-none py-3", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative w-full">
      <select className={cn(control, "appearance-none pr-10", className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-3.5 -translate-y-1/2 text-body"
      />
    </div>
  );
}

/** Slate-bordered dropdown-style button used in control bars. */
export function FilterSelect({
  label,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"select"> & { label: string }) {
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{label}</span>
      <select
        className="appearance-none rounded-sm border border-line bg-transparent py-2.5 pr-9 pl-4 font-sans text-14 font-semibold leading-native text-body focus-visible:outline-none"
        {...rest}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 size-3.5 text-body" />
    </label>
  );
}
