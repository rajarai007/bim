import { faqRepository } from "../repositories/faq.repository";
import { ApiError } from "../utils/api-error";
import type { FaqBody } from "../validators/catalog.validator";
import { publicFaq } from "./serializers";

export const faqService = {
  async listCategories() {
    return faqRepository.findCategories();
  },

  async listPublic(filters: { home?: boolean }) {
    const faqs = await faqRepository.findAll({ status: "published", showOnHome: filters.home ? true : undefined });
    return faqs.map(publicFaq);
  },

  async listAdmin(q?: string) {
    return faqRepository.findAll({ q });
  },

  async getAdmin(id: number) {
    const faq = await faqRepository.findById(id);
    if (!faq) throw ApiError.notFound("FAQ not found");
    return faq;
  },

  async create(body: FaqBody) {
    await assertCategory(body.faqCategoryId);
    return faqRepository.create(body);
  },

  async update(id: number, body: FaqBody) {
    await assertCategory(body.faqCategoryId);
    const updated = await faqRepository.update(id, body);
    if (!updated) throw ApiError.notFound("FAQ not found");
    return updated;
  },

  async delete(id: number) {
    const deleted = await faqRepository.delete(id);
    if (!deleted) throw ApiError.notFound("FAQ not found");
  },
};

async function assertCategory(id: number) {
  if (!(await faqRepository.findCategoryById(id))) {
    throw ApiError.unprocessable("Validation failed", [{ field: "faqCategoryId", message: "FAQ category does not exist" }]);
  }
}
