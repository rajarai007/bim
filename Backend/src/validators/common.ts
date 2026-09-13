import { z } from "zod";

export const idParam = z.object({
  id: z.coerce.number().int().positive({ message: "Invalid id" }),
});

export const slugParam = z.object({
  slug: z.string().trim().min(1).max(160),
});

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens");

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

/** Accepts "true"/"false"/"1"/"0" query values. */
export const booleanQuery = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1")
  .optional();

/** Trims strings and turns "" into null for optional text columns. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

export const optionalUrl = (max = 512) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^(https?:\/\/|\/)/.test(v), "Must be an absolute URL or a path starting with /");

/** "a, b\nc" | ["a","b"] → ["a","b","c"] */
export const stringList = z
  .union([z.string(), z.array(z.string())])
  .nullish()
  .transform((v) => {
    if (!v) return [] as string[];
    const parts = Array.isArray(v) ? v : v.split(/[\n,]/);
    return parts.map((s) => s.trim()).filter(Boolean).slice(0, 50);
  });

export const requiredText = (field: string, max: number, min = 1) =>
  z.string({ message: `${field} is required` }).trim().min(min, `${field} is required`).max(max, `${field} must be at most ${max} characters`);
