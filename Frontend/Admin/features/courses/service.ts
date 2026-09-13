import { adminFetch, ApiError } from "@/lib/api";
import type { AdminCourse, CategoryRecord, CourseStatus, Paginated } from "@/types";

export type CourseListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  status?: CourseStatus | "all";
};

export async function listCourses(params: CourseListParams = {}): Promise<Paginated<AdminCourse>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 10));
  if (params.q) qs.set("q", params.q);
  if (params.category && params.category !== "all") qs.set("category", params.category);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  return adminFetch<Paginated<AdminCourse>>(`/admin/courses?${qs.toString()}`);
}

export async function getCourse(id: string | number): Promise<AdminCourse | undefined> {
  try {
    return await adminFetch<AdminCourse>(`/admin/courses/${encodeURIComponent(String(id))}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 422)) return undefined;
    throw err;
  }
}

/** Categories for the editor / filter selects. */
export async function listCourseCategories(): Promise<CategoryRecord[]> {
  return adminFetch<CategoryRecord[]>("/admin/categories");
}
