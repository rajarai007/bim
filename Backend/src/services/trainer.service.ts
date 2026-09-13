import { trainerRepository } from "../repositories/trainer.repository";
import { ApiError } from "../utils/api-error";
import type { TrainerBody } from "../validators/catalog.validator";
import { adminTrainer, publicTrainer } from "./serializers";

export const trainerService = {
  async listPublic(filters: { home?: boolean }) {
    const trainers = await trainerRepository.findAll({ status: "active", showOnHome: filters.home ? true : undefined });
    return trainers.map(publicTrainer);
  },

  async listAdmin(q?: string) {
    return (await trainerRepository.findAll({ q })).map(adminTrainer);
  },

  async getAdmin(id: number) {
    const trainer = await trainerRepository.findById(id);
    if (!trainer) throw ApiError.notFound("Trainer not found");
    return adminTrainer(trainer);
  },

  async create(body: TrainerBody) {
    return adminTrainer(await trainerRepository.create(body));
  },

  async update(id: number, body: TrainerBody) {
    const updated = await trainerRepository.update(id, body);
    if (!updated) throw ApiError.notFound("Trainer not found");
    return adminTrainer(updated);
  },

  async delete(id: number) {
    const deleted = await trainerRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Trainer not found");
  },
};
