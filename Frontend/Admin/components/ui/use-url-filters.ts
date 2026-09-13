"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps list filters in the URL so the server component re-queries the API.
 * Text inputs are debounced; every change resets the page to 1.
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const get = useCallback((key: string, fallback = "") => searchParams.get(key) ?? fallback, [searchParams]);

  return { get, set };
}

/** Local text state that pushes to the URL after `delay` ms of inactivity. */
export function useDebouncedParam(key: string, delay = 300) {
  const { get, set } = useUrlFilters();
  const urlValue = get(key);
  const [value, setValue] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync when the URL changes elsewhere (e.g. back navigation).
  const [lastUrlValue, setLastUrlValue] = useState(urlValue);
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => set({ [key]: next.trim() || undefined }), delay);
  };

  return [value, onChange] as const;
}
