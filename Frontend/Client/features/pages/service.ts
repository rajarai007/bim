import { cache } from "react";
import type { Metadata } from "next";
import { apiFetch, ApiError } from "@/lib/api";
import type { PageMeta } from "@/types";

const getPages = cache(async (): Promise<PageMeta[]> => {
  try {
    return await apiFetch<PageMeta[]>("/pages");
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    console.error("[pages] unable to load SEO meta:", err.message);
    return [];
  }
});

/** SEO meta managed in the admin console, falling back to the static values. */
export async function getPageMetadata(path: string, defaults: { title: string; description: string }): Promise<Metadata> {
  const page = (await getPages()).find((p) => p.path === path);
  return {
    title: page?.metaTitle ? { absolute: page.metaTitle } : defaults.title,
    description: page?.metaDescription ?? defaults.description,
  };
}
