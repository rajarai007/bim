"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch, ApiError } from "@/lib/api";
import { routes } from "@/lib/constants";
import type { ActionState, AdminCourse, SyllabusModule } from "@/types";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

/**
 * The syllabus textarea accepts either a JSON array of `{ title, description }`
 * or a plain list (one module per line / comma, optional " - description").
 */
export async function parseSyllabus(raw: string): Promise<SyllabusModule[]> {
  const value = raw.trim();
  if (!value) return [];
  if (value.startsWith("[")) {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Syllabus JSON must be an array");
    return parsed.map((m) => {
      if (typeof m === "string") return { title: m, description: "" };
      const mod = m as { title?: unknown; description?: unknown };
      return { title: String(mod.title ?? "").trim(), description: String(mod.description ?? "").trim() };
    });
  }
  const parts = value.includes("\n") ? value.split(/\n+/) : value.split(/,(?=\s*Module\s*\d|\s*[A-Z])/);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [title, ...rest] = p.split(/\s+[-–—|]\s+/);
      return { title: (title ?? "").trim(), description: rest.join(" - ").trim() };
    });
}

function bodyFromForm(formData: FormData, syllabus: SyllabusModule[]) {
  const intent = text(formData, "intent");
  const active = formData.get("active") === "on";
  return {
    categoryId: Number(text(formData, "category")),
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    shortDescription: text(formData, "shortDescription"),
    fullDescription: text(formData, "fullDescription") || null,
    eligibility: text(formData, "eligibility") || null,
    whoShouldJoin: text(formData, "whoShouldJoin") || null,
    outcomes: text(formData, "outcomes"),
    syllabus,
    software: text(formData, "software"),
    careers: text(formData, "careers"),
    durationWeeks: Number(text(formData, "duration")),
    trainingMode: text(formData, "mode") || "Offline Lab",
    batchLocation: text(formData, "location") || null,
    imageUrl: text(formData, "imageUrl") || null,
    imageAlt: text(formData, "imageAlt") || null,
    syllabusUrl: text(formData, "syllabusUrl") || null,
    status: intent === "draft" ? "draft" : active ? "active" : "inactive",
    isFeatured: formData.get("featured") === "on",
    metaTitle: text(formData, "metaTitle") || null,
    metaDescription: text(formData, "metaDescription") || null,
  };
}

export async function saveCourse(courseId: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let syllabus: SyllabusModule[];
  try {
    syllabus = await parseSyllabus(text(formData, "syllabus"));
  } catch (err) {
    return { error: "Please correct the highlighted fields.", fieldErrors: { syllabus: `Invalid syllabus: ${(err as Error).message}` } };
  }
  const body = bodyFromForm(formData, syllabus);
  const intent = text(formData, "intent");

  let saved: AdminCourse;
  try {
    saved = courseId
      ? await adminFetch<AdminCourse>(`/admin/courses/${courseId}`, { method: "PUT", body: JSON.stringify(body) })
      : await adminFetch<AdminCourse>("/admin/courses", { method: "POST", body: JSON.stringify(body) });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message, fieldErrors: err.fieldErrors };
    throw err;
  }

  revalidatePath(routes.courses);
  revalidatePath(routes.courseEdit(String(saved.id)));
  // Redirect (even on update) so the editor remounts with fresh server data and the message survives.
  const saved_ = intent === "draft" ? "draft" : body.status === "active" ? "published" : "saved";
  redirect(`${routes.courseEdit(String(saved.id))}?saved=${saved_}`);
}

export async function setCourseFeatured(id: number, isFeatured: boolean): Promise<ActionState> {
  try {
    await adminFetch(`/admin/courses/${id}/featured`, { method: "PATCH", body: JSON.stringify({ isFeatured }) });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
  revalidatePath(routes.courses);
  return { ok: true };
}

export async function deleteCourse(id: number): Promise<ActionState> {
  try {
    await adminFetch(`/admin/courses/${id}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
  revalidatePath(routes.courses);
  return { ok: true, message: "Course deleted." };
}
