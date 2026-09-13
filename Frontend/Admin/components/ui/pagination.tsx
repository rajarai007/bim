"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/** URL-driven pagination: writes `?page=N` and lets the server component re-query. */
export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const go = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Window of up to 5 page numbers around the current page.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const nums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  const pill =
    "rounded-xs border border-line bg-page px-3 py-1.5 font-sans text-12 leading-native text-body transition-colors hover:bg-line/60 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <nav aria-label="Pagination" className="flex w-full flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-sans text-13 leading-native text-muted">
        Showing {from} to {to} of {total.toLocaleString("en-IN")} entries
      </p>
      <div className="flex items-start gap-1">
        <button type="button" className={cn(pill, "px-2.5")} disabled={page <= 1} onClick={() => go(page - 1)}>
          Previous
        </button>
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => go(n)}
            className={cn(
              n === page
                ? "rounded-xs bg-primary px-3 py-1.5 font-sans text-12 font-bold leading-native text-white"
                : pill,
            )}
          >
            {n}
          </button>
        ))}
        <button type="button" className={cn(pill, "px-2.5")} disabled={page >= totalPages} onClick={() => go(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}
