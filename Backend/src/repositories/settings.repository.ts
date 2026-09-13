import { query } from "../config/database";
import type { SiteSettings } from "../models";
import { toCamel } from "./mapper";

const columns = `academy_name, address, phone, whatsapp, email, working_hours, logo_url, instagram_url, facebook_url,
  linkedin_url, youtube_url, webhook_url, ga_measurement_id, updated_at`;

const columnMap: Record<keyof Omit<SiteSettings, "updatedAt">, string> = {
  academyName: "academy_name",
  address: "address",
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
  workingHours: "working_hours",
  logoUrl: "logo_url",
  instagramUrl: "instagram_url",
  facebookUrl: "facebook_url",
  linkedinUrl: "linkedin_url",
  youtubeUrl: "youtube_url",
  webhookUrl: "webhook_url",
  gaMeasurementId: "ga_measurement_id",
};

export type SettingsPatch = Partial<Omit<SiteSettings, "updatedAt">>;

export const settingsRepository = {
  async get(): Promise<SiteSettings | null> {
    const { rows } = await query(`SELECT ${columns} FROM site_settings WHERE id = 1`);
    return rows[0] ? toCamel<SiteSettings>(rows[0]) : null;
  },

  async update(patch: SettingsPatch): Promise<SiteSettings | null> {
    const entries = Object.entries(patch).filter(([key]) => key in columnMap);
    if (!entries.length) return this.get();
    const sets = entries.map(([key], i) => `${columnMap[key as keyof typeof columnMap]} = $${i + 1}`);
    const params = entries.map(([, value]) => value);
    const { rowCount } = await query(`UPDATE site_settings SET ${sets.join(", ")} WHERE id = 1`, params);
    return rowCount ? this.get() : null;
  },
};
