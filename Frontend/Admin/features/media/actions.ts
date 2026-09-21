"use server";

import { revalidatePath } from "next/cache";
import { adminFetch, ApiError } from "@/lib/api";
import { routes } from "@/lib/constants";
import type { ActionState, MediaItem } from "@/types";

export type UploadResult = ActionState & { media?: MediaItem };

/** Uploads one file (image or PDF, multipart) and returns the stored media record. */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a file." };
  const body = new FormData();
  body.append("file", file, file.name);
  try {
    const media = await adminFetch<MediaItem>("/admin/media", { method: "POST", body });
    revalidatePath(routes.media);
    return { ok: true, media };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.fieldErrors.file ?? err.message };
    throw err;
  }
}

export async function deleteMedia(id: number): Promise<ActionState> {
  try {
    await adminFetch(`/admin/media/${id}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
  revalidatePath(routes.media);
  return { ok: true, message: "File deleted." };
}
