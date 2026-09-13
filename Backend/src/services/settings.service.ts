import { pageRepository } from "../repositories/page.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { ApiError } from "../utils/api-error";
import type { SettingsPatch } from "../validators/settings.validator";
import { publicSettings } from "./serializers";

export const settingsService = {
  async getPublic() {
    const settings = await settingsRepository.get();
    if (!settings) throw ApiError.notFound("Site settings have not been configured");
    return publicSettings(settings);
  },

  async getAdmin() {
    const settings = await settingsRepository.get();
    if (!settings) throw ApiError.notFound("Site settings have not been configured");
    return settings;
  },

  async update(patch: SettingsPatch) {
    const updated = await settingsRepository.update(patch);
    if (!updated) throw ApiError.notFound("Site settings have not been configured");
    return updated;
  },

  async listPages() {
    return pageRepository.findAll();
  },

  async getPageByPath(path: string) {
    const page = await pageRepository.findByPath(path);
    if (!page) throw ApiError.notFound("Page not found");
    return page;
  },

  async updatePageMeta(id: number, meta: { metaTitle: string | null; metaDescription: string | null }) {
    const updated = await pageRepository.updateMeta(id, meta);
    if (!updated) throw ApiError.notFound("Page not found");
    return updated;
  },
};
