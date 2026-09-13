"use server";

import { apiFetch, ApiError } from "@/lib/api";
import type { EnquiryErrors, EnquiryPayload } from "./schema";

export type SubmitEnquiryResult =
  | { ok: true; id: number }
  | { ok: false; message: string; errors: EnquiryErrors };

/** Field names as the API knows them → form field names. */
const fieldMap: Record<string, keyof EnquiryPayload> = {
  fullName: "fullName",
  mobile: "mobile",
  email: "email",
  courseSlug: "course",
  qualification: "qualification",
  experience: "experience",
  message: "message",
  consent: "consent",
};

/** Submits an enquiry to the backend (runs on the server, so the API origin stays private). */
export async function submitEnquiry(
  payload: EnquiryPayload,
  source: "contact_form" | "course_page" = "contact_form",
): Promise<SubmitEnquiryResult> {
  try {
    const data = await apiFetch<{ id: number }>("/enquiries", {
      method: "POST",
      body: JSON.stringify({
        fullName: payload.fullName,
        mobile: payload.mobile,
        email: payload.email || null,
        courseSlug: payload.course || null,
        qualification: payload.qualification || null,
        experience: payload.experience || null,
        message: payload.message || null,
        consent: Boolean(payload.consent),
        source,
      }),
    });
    return { ok: true, id: data.id };
  } catch (err) {
    if (err instanceof ApiError) {
      const errors: EnquiryErrors = {};
      for (const e of err.errors) {
        const key = fieldMap[e.field];
        if (key && !errors[key]) errors[key] = e.message;
      }
      return {
        ok: false,
        message: err.status === 429 ? err.message : Object.keys(errors).length ? "Please correct the highlighted fields." : "Something went wrong. Please try again.",
        errors,
      };
    }
    return { ok: false, message: "Something went wrong. Please try again.", errors: {} };
  }
}
