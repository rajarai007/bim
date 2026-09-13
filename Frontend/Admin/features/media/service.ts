import { adminFetch } from "@/lib/api";
import type { MediaItem } from "@/types";

export async function listMedia(): Promise<MediaItem[]> {
  return adminFetch<MediaItem[]>("/admin/media");
}
