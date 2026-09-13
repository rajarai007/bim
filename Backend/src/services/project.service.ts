import { categoryRepository } from "../repositories/category.repository";
import { projectRepository } from "../repositories/project.repository";
import { ApiError } from "../utils/api-error";
import type { ProjectBody } from "../validators/catalog.validator";
import { publicProject } from "./serializers";

export const projectService = {
  async listPublic(filters: { home?: boolean }) {
    const projects = await projectRepository.findAll({
      status: "published",
      activeCategory: true,
      showOnHome: filters.home ? true : undefined,
    });
    return projects.map(publicProject);
  },

  async listAdmin(q?: string) {
    return projectRepository.findAll({ q });
  },

  async getAdmin(id: number) {
    const project = await projectRepository.findById(id);
    if (!project) throw ApiError.notFound("Project not found");
    return project;
  },

  async create(body: ProjectBody) {
    await assertCategory(body.categoryId);
    return projectRepository.create(body);
  },

  async update(id: number, body: ProjectBody) {
    await assertCategory(body.categoryId);
    const updated = await projectRepository.update(id, body);
    if (!updated) throw ApiError.notFound("Project not found");
    return updated;
  },

  async delete(id: number) {
    const deleted = await projectRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Project not found");
  },
};

async function assertCategory(categoryId: number) {
  if (!(await categoryRepository.findById(categoryId))) {
    throw ApiError.unprocessable("Validation failed", [{ field: "categoryId", message: "Category does not exist" }]);
  }
}
