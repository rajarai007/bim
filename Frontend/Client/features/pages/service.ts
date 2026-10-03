import { cache } from "react";
import type { Metadata } from "next";
import { apiFetch, ApiError } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import type { PageMeta } from "@/types";

export const getPages = cache(async (): Promise<PageMeta[]> => {
  try {
    return await apiFetch<PageMeta[]>("/pages");
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    console.error("[pages] unable to load SEO meta:", err.message);
    return [];
  }
});

/**
 * Head tags for a static page. The title and description set in the admin
 * console (SEO tab) win; `defaults` are used until one is saved there.
 * Both are complete titles, written without relying on the layout template.
 */
export async function getPageMetadata(path: string, defaults: { title: string; description: string }): Promise<Metadata> {
  const page = (await getPages()).find((p) => p.path === path);
  return buildMetadata({
    path,
    title: page?.metaTitle || defaults.title,
    description: page?.metaDescription || defaults.description,
  });
}
