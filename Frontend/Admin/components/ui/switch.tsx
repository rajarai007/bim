"use client";

import { cn } from "@/lib/utils";

/** 44×24 toggle matching the Figma switch (green when on, slate when off). */
export function Switch({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  name?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-150 ease-brand",
        checked ? "bg-success" : "bg-line",
      )}
    >
      {name && checked ? <input type="hidden" name={name} value="on" /> : null}
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-pill bg-white transition-transform duration-150 ease-brand",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
