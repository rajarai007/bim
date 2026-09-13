import { adminFetch } from "@/lib/api";
import type { CategoryRecord, FaqCategory, FaqRecord, ProjectRecord, TestimonialRecord, TrainerRecord } from "@/types";

export async function listCategories(): Promise<CategoryRecord[]> {
  return adminFetch<CategoryRecord[]>("/admin/categories");
}
export async function listTrainers(): Promise<TrainerRecord[]> {
  return adminFetch<TrainerRecord[]>("/admin/trainers");
}
export async function listTestimonials(): Promise<TestimonialRecord[]> {
  return adminFetch<TestimonialRecord[]>("/admin/testimonials");
}
export async function listProjects(): Promise<ProjectRecord[]> {
  return adminFetch<ProjectRecord[]>("/admin/projects");
}
export async function listFaqs(): Promise<FaqRecord[]> {
  return adminFetch<FaqRecord[]>("/admin/faqs");
}
export async function listFaqCategories(): Promise<FaqCategory[]> {
  return adminFetch<FaqCategory[]>("/faq-categories");
}
