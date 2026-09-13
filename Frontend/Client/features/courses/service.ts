/**
 * Course data access layer — every function hits the backend API so pages
 * always render the catalogue the admin console manages.
 */
import { cache } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { resolveImage } from "@/lib/media";
import type { Category, Course, CourseDetail, ImageAsset } from "@/types";

type ApiImage = { src: string; alt: string } | null;
type ApiCourse = Omit<Course, "image"> & { image: ApiImage };
type ApiCourseDetail = Omit<CourseDetail, "image" | "related"> & { image: ApiImage; related: ApiCourse[] };

function mapCourse(c: ApiCourse): Course {
  return { ...c, image: resolveImage(c.image, c.title) as ImageAsset };
}

export const getCategories = cache(async (): Promise<Category[]> => apiFetch<Category[]>("/categories"));

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | undefined> => {
  try {
    return await apiFetch<Category>(`/categories/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
});

/** All active courses (optionally for one category). */
export const getCourses = cache(async (categorySlug?: string): Promise<Course[]> => {
  const qs = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
  return (await apiFetch<ApiCourse[]>(`/courses${qs}`)).map(mapCourse);
});

export async function getCoursesByCategory(categorySlug: string): Promise<Course[]> {
  return getCourses(categorySlug);
}

/** Courses pinned to the home page ("Featured Course" in the admin console). */
export const getHomeFeaturedCourses = cache(async (): Promise<Course[]> => {
  return (await apiFetch<ApiCourse[]>("/courses?featured=true")).map(mapCourse);
});

export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | undefined> => {
  try {
    const course = await apiFetch<ApiCourseDetail>(`/courses/${encodeURIComponent(slug)}`);
    return { ...course, image: resolveImage(course.image, course.title), related: course.related.map(mapCourse) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
});
