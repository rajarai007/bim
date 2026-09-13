import { categoryRepository } from "../repositories/category.repository";
import { ApiError } from "../utils/api-error";
import type { CategoryBody } from "../validators/catalog.validator";
import { publicCategory } from "./serializers";

export const categoryService = {
  async listPublic() {
    const categories = await categoryRepository.findAll({ status: "active" });
    return categories.map(publicCategory);
  },

  async getPublicBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug, "active");
    if (!category) throw ApiError.notFound("Category not found");
    return publicCategory(category);
  },

  async listAdmin() {
    return categoryRepository.findAll();
  },

  async getAdmin(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw ApiError.notFound("Category not found");
    return category;
  },

  async create(body: CategoryBody) {
    const sortOrder = body.sortOrder ?? (await categoryRepository.nextSortOrder());
    return categoryRepository.create({ ...body, sortOrder });
  },

  async update(id: number, body: CategoryBody) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw ApiError.notFound("Category not found");
    const updated = await categoryRepository.update(id, { ...body, sortOrder: body.sortOrder ?? existing.sortOrder });
    return updated!;
  },

  async delete(id: number) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw ApiError.notFound("Category not found");
    const [courses, projects] = await Promise.all([
      categoryRepository.countCourses(id),
      categoryRepository.countProjects(id),
    ]);
    if (courses || projects) {
      throw ApiError.conflict(
        `Cannot delete "${existing.name}" while ${courses} course(s) and ${projects} project(s) belong to it. Move or delete them first.`,
      );
    }
    await categoryRepository.delete(id);
  },
};
