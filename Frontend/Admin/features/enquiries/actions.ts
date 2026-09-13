"use server";

import { revalidatePath } from "next/cache";
import { adminFetch, ApiError } from "@/lib/api";
import { routes } from "@/lib/constants";
import type { ActionState, Lead, LeadStatus } from "@/types";

export async function updateLeadStatus(id: number, status: LeadStatus): Promise<ActionState & { lead?: Lead }> {
  try {
    const lead = await adminFetch<Lead>(`/admin/enquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    revalidatePath(routes.enquiries);
    revalidatePath(routes.dashboard);
    return { ok: true, lead };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function addLeadNote(id: number, note: string): Promise<ActionState & { lead?: Lead }> {
  try {
    const result = await adminFetch<{ lead: Lead; enquiry: Lead }>(`/admin/enquiries/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    revalidatePath(routes.enquiries);
    return { ok: true, lead: result.enquiry };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.fieldErrors.note ?? err.message };
    throw err;
  }
}
