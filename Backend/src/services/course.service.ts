import { categoryRepository } from "../repositories/category.repository";
import { courseRepository } from "../repositories/course.repository";
import { ApiError } from "../utils/api-error";
import { paginate } from "../utils/response";
import type { CourseBody } from "../validators/catalog.validator";
import type { CourseStatus } from "../types";
import { adminCourse, publicCourseCard, publicCourseDetail } from "./serializers";

export const courseService = {
  /* ---------------------------------------------------------- public */
  async listPublic(filters: { category?: string; featured?: boolean }) {
    const courses = await courseRepository.findAll({
      status: "active",
      activeCategory: true,
      categorySlug: filters.category,
      featured: filters.featured,
    });
    return courses.map(publicCourseCard);
  },

  async getPublicBySlug(slug: string) {
    const course = await courseRepository.findBySlug(slug, { status: "active", activeCategory: true });
    if (!course) throw ApiError.notFound("Course not found");
    const related = await courseRepository.findRelated(course);
    return publicCourseDetail(course, related);
  },

  /* ----------------------------------------------------------- admin */
  async listAdmin(query: { page: number; pageSize: number; q?: string; category?: string; status?: CourseStatus }) {
    const { items, total } = await courseRepository.list({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      categorySlug: query.category,
      status: query.status,
    });
    return { items: items.map(adminCourse), pagination: paginate(query.page, query.pageSize, total) };
  },

  async getAdmin(id: number) {
    const course = await courseRepository.findById(id);
    if (!course) throw ApiError.notFound("Course not found");
    return adminCourse(course);
  },

  async create(body: CourseBody) {
    await this.assertCategory(body.categoryId);
    if (await courseRepository.findBySlug(body.slug)) {
      throw ApiError.conflict("A course with this slug already exists", [{ field: "slug", message: "Must be unique" }]);
    }
    return adminCourse(await courseRepository.create(body));
  },

  async update(id: number, body: CourseBody) {
    const existing = await courseRepository.findById(id);
    if (!existing) throw ApiError.notFound("Course not found");
    await this.assertCategory(body.categoryId);
    const slugOwner = await courseRepository.findBySlug(body.slug);
    if (slugOwner && slugOwner.id !== id) {
      throw ApiError.conflict("A course with this slug already exists", [{ field: "slug", message: "Must be unique" }]);
    }
    return adminCourse((await courseRepository.update(id, body))!);
  },

  async setFeatured(id: number, isFeatured: boolean) {
    const updated = await courseRepository.setFeatured(id, isFeatured);
    if (!updated) throw ApiError.notFound("Course not found");
    return adminCourse(updated);
  },

  async delete(id: number) {
    const deleted = await courseRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Course not found");
  },

  async assertCategory(categoryId: number) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw ApiError.unprocessable("Validation failed", [{ field: "categoryId", message: "Category does not exist" }]);
    }
  },
};
