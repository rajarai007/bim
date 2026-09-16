"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `router.replace` commits asynchronously (the new search params arrive with
 * the server response), so a write issued while another is in flight must
 * build on the params written last, not on the URL. One pending record is
 * enough: only one filter bar is on screen at a time.
 */
let pendingWrite: { pathname: string; params: string } | null = null;

/**
 * Keeps list filters in the URL so the server component re-queries the API.
 * Text inputs are debounced; every change resets the page to 1.
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Once the router has caught up with the last write, the URL is authoritative again.
  useEffect(() => {
    if (pendingWrite && pendingWrite.pathname === pathname && pendingWrite.params === searchParams.toString()) {
      pendingWrite = null;
    }
  }, [pathname, searchParams]);

  const set = useCallback(
    (updates: Record<string, string | undefined>) => {
      const base = pendingWrite && pendingWrite.pathname === pathname ? pendingWrite.params : window.location.search;
      const params = new URLSearchParams(base);
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      const qs = params.toString();
      pendingWrite = { pathname, params: qs };
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
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
