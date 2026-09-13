import type { ComponentPropsWithoutRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({ className, ...rest }: ComponentPropsWithoutRef<"input">) {
  return (
    <label className={cn("flex items-center gap-2 rounded-sm border border-line bg-page px-4 py-2.5", className)}>
      <Search className="size-4 shrink-0 text-body" aria-hidden />
      <input
        type="search"
        className="min-w-0 flex-1 bg-transparent font-sans text-14 leading-native text-ink placeholder:text-muted focus-visible:outline-none"
        {...rest}
      />
    </label>
  );
}
