"use server";

import { revalidatePath } from "next/cache";
import { adminFetch, ApiError } from "@/lib/api";
import { routes } from "@/lib/constants";
import type { ActionState } from "@/types";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Each settings tab submits only its own fields; the API merges partial updates. */
export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tab = text(formData, "tab");
  let body: Record<string, unknown>;
  if (tab === "Social Media") {
    body = {
      instagramUrl: text(formData, "instagram") || null,
      facebookUrl: text(formData, "facebook") || null,
      linkedinUrl: text(formData, "linkedin") || null,
      youtubeUrl: text(formData, "youtube") || null,
    };
  } else if (tab === "Integration API") {
    body = {
      webhookUrl: text(formData, "webhook") || null,
      whatsapp: text(formData, "waNumber") || null,
      gaMeasurementId: text(formData, "ga") || null,
    };
  } else {
    body = {
      academyName: text(formData, "academyName"),
      address: text(formData, "address"),
      phone: text(formData, "phone"),
      whatsapp: text(formData, "whatsapp") || null,
      email: text(formData, "email"),
      workingHours: text(formData, "hours") || null,
      logoUrl: text(formData, "logoUrl") || null,
      instagramUrl: text(formData, "instagram") || null,
      facebookUrl: text(formData, "facebook") || null,
      linkedinUrl: text(formData, "linkedin") || null,
      youtubeUrl: text(formData, "youtube") || null,
    };
  }
  try {
    await adminFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(body) });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message, fieldErrors: err.fieldErrors };
    throw err;
  }
  revalidatePath(routes.settings);
  return { ok: true, message: "Changes saved." };
}

export async function savePageMeta(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ids = formData.getAll("pageId").map(Number).filter(Boolean);
  const fieldErrors: Record<string, string> = {};
  for (const id of ids) {
    try {
      await adminFetch(`/admin/pages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          metaTitle: text(formData, `${id}-title`) || null,
          metaDescription: text(formData, `${id}-description`) || null,
        }),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        for (const [field, message] of Object.entries(err.fieldErrors)) fieldErrors[`${id}-${field}`] = message;
        if (!Object.keys(err.fieldErrors).length) return { error: err.message };
      } else throw err;
    }
  }
  if (Object.keys(fieldErrors).length) return { error: "Please correct the highlighted fields.", fieldErrors };
  revalidatePath(routes.seo);
  revalidatePath(routes.content);
  return { ok: true, message: "SEO settings saved." };
}
