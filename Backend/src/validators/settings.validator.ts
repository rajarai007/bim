import { z } from "zod";
import { optionalText, optionalUrl, requiredText } from "./common";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(512)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/\S+$/.test(v), "Must be a valid http(s) URL");

/** Every field is optional so each settings tab can save independently. */
export const settingsPatchSchema = z
  .object({
    academyName: requiredText("Academy name", 160),
    address: requiredText("Address", 1000),
    phone: requiredText("Phone", 40),
    whatsapp: optionalText(40),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
    workingHours: optionalText(120),
    logoUrl: optionalUrl(),
    instagramUrl: optionalHttpUrl,
    facebookUrl: optionalHttpUrl,
    linkedinUrl: optionalHttpUrl,
    youtubeUrl: optionalHttpUrl,
    webhookUrl: optionalHttpUrl,
    gaMeasurementId: optionalText(40)
      .transform((v) => (v ? v.toUpperCase() : v))
      .refine((v) => v === null || /^(G|UA|AW|DC|GT)-[A-Z0-9-]+$/.test(v), "Must be a Google measurement ID such as G-XXXXXXXXXX"),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "No settings provided");
export type SettingsPatch = z.infer<typeof settingsPatchSchema>;

export const pageMetaSchema = z.object({
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});
