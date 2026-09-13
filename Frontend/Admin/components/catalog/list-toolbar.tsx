"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";

/** Search + primary action bar shared by the catalogue list screens. */
export function ListToolbar({
  placeholder,
  query,
  onQueryChange,
  action,
  onAction,
  children,
}: {
  placeholder: string;
  query: string;
  onQueryChange: (v: string) => void;
  action: string;
  onAction: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <SearchInput
          placeholder={placeholder}
          aria-label={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full sm:w-[320px]"
        />
        {children}
      </div>
      <Button type="button" className="shrink-0" onClick={onAction}>
        <Plus className="size-4" aria-hidden />
        {action}
      </Button>
    </Card>
  );
}
