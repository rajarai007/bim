import { testimonialRepository } from "../repositories/testimonial.repository";
import { ApiError } from "../utils/api-error";
import type { TestimonialBody } from "../validators/catalog.validator";
import { publicTestimonial } from "./serializers";

export const testimonialService = {
  async listPublic() {
    return (await testimonialRepository.findAll({ status: "published" })).map(publicTestimonial);
  },

  async listAdmin(q?: string) {
    return testimonialRepository.findAll({ q });
  },

  async getAdmin(id: number) {
    const item = await testimonialRepository.findById(id);
    if (!item) throw ApiError.notFound("Testimonial not found");
    return item;
  },

  async create(body: TestimonialBody) {
    return testimonialRepository.create(body);
  },

  async update(id: number, body: TestimonialBody) {
    const updated = await testimonialRepository.update(id, body);
    if (!updated) throw ApiError.notFound("Testimonial not found");
    return updated;
  },

  async delete(id: number) {
    const deleted = await testimonialRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Testimonial not found");
  },
};
