"use server";

import { revalidatePath } from "next/cache";
import { adminFetch, ApiError } from "@/lib/api";
import { routes } from "@/lib/constants";
import type { ActionState } from "@/types";

export type CatalogEntity = "categories" | "trainers" | "testimonials" | "projects" | "faqs";

const revalidateFor: Record<CatalogEntity, string> = {
  categories: routes.categories,
  trainers: routes.trainers,
  testimonials: routes.testimonials,
  projects: routes.projects,
  faqs: routes.faqs,
};

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => text(fd, key) || null;
const bool = (fd: FormData, key: string) => fd.get(key) === "on";

/** Maps each entity's form fields onto the API body. */
const mappers: Record<CatalogEntity, (fd: FormData) => Record<string, unknown>> = {
  categories: (fd) => ({
    slug: text(fd, "slug"),
    name: text(fd, "name"),
    badge: text(fd, "badge"),
    summary: text(fd, "summary"),
    tagline: text(fd, "tagline"),
    description: text(fd, "description"),
    icon: text(fd, "icon") || "box",
    footerLabel: text(fd, "footerLabel") || text(fd, "name"),
    overviewTitle: text(fd, "overviewTitle") || text(fd, "name"),
    status: bool(fd, "active") ? "active" : "inactive",
  }),
  trainers: (fd) => ({
    name: text(fd, "name"),
    role: text(fd, "role"),
    homeRole: optional(fd, "homeRole"),
    specialization: optional(fd, "specialization"),
    bio: text(fd, "bio"),
    experienceYears: Number(text(fd, "experienceYears") || 0),
    tags: text(fd, "tags"),
    imageUrl: optional(fd, "imageUrl"),
    imageAlt: optional(fd, "imageAlt"),
    linkedinUrl: optional(fd, "linkedinUrl"),
    showOnHome: bool(fd, "showOnHome"),
    status: bool(fd, "active") ? "active" : "inactive",
  }),
  testimonials: (fd) => ({
    name: text(fd, "name"),
    program: text(fd, "program"),
    quote: text(fd, "quote"),
    rating: Number(text(fd, "rating") || 5),
    avatarUrl: optional(fd, "avatarUrl"),
    status: bool(fd, "published") ? "published" : "pending",
  }),
  projects: (fd) => ({
    categoryId: Number(text(fd, "categoryId")),
    title: text(fd, "title"),
    description: text(fd, "description"),
    software: text(fd, "software"),
    imageUrl: optional(fd, "imageUrl"),
    imageAlt: optional(fd, "imageAlt"),
    showOnHome: bool(fd, "showOnHome"),
    status: bool(fd, "published") ? "published" : "draft",
  }),
  faqs: (fd) => ({
    faqCategoryId: Number(text(fd, "faqCategoryId")),
    question: text(fd, "question"),
    answer: text(fd, "answer"),
    showOnHome: bool(fd, "showOnHome"),
    status: bool(fd, "published") ? "published" : "draft",
  }),
};

export async function saveCatalogItem(
  entity: CatalogEntity,
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const body = mappers[entity](formData);
  try {
    if (id) await adminFetch(`/admin/${entity}/${id}`, { method: "PUT", body: JSON.stringify(body) });
    else await adminFetch(`/admin/${entity}`, { method: "POST", body: JSON.stringify(body) });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message, fieldErrors: err.fieldErrors };
    throw err;
  }
  revalidatePath(revalidateFor[entity]);
  if (entity === "categories") revalidatePath(routes.courses);
  return { ok: true, message: id ? "Changes saved." : "Created successfully." };
}

export async function deleteCatalogItem(entity: CatalogEntity, id: number): Promise<ActionState> {
  try {
    await adminFetch(`/admin/${entity}/${id}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
  revalidatePath(revalidateFor[entity]);
  return { ok: true, message: "Deleted." };
}
