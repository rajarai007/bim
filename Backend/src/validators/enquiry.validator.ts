import { z } from "zod";
import { optionalText, paginationQuery, requiredText } from "./common";

export const enquiryStatuses = ["new", "contacted", "follow-up", "converted", "lost"] as const;
export const experienceLevels = ["Student", "Fresher", "Professional"] as const;

const MOBILE_RE = /^\+?[0-9\s-]{10,16}$/;

export const createEnquirySchema = z.object({
  fullName: requiredText("Full name", 120, 2),
  mobile: z
    .string({ message: "Mobile number is required" })
    .trim()
    .min(1, "Mobile number is required")
    .regex(MOBILE_RE, "Enter a valid mobile number"),
  email: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v.toLowerCase() : null))
    .refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address"),
  /** Slug of the course the visitor is interested in. */
  courseSlug: optionalText(160),
  qualification: optionalText(160),
  experience: z.enum(experienceLevels).or(z.literal("")).nullish().transform((v) => (v ? v : null)),
  message: optionalText(4000),
  consent: z.boolean().optional().default(false),
  source: z.enum(["contact_form", "course_page", "syllabus_download"]).default("contact_form"),
});
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

export const enquiryListQuery = paginationQuery.extend({
  q: z.string().trim().max(120).optional(),
  status: z.enum(enquiryStatuses).optional(),
  course: z.string().trim().max(160).optional(),
  days: z.coerce.number().int().min(1).max(3650).optional(),
});

export const enquiryExportQuery = enquiryListQuery.omit({ page: true, pageSize: true });

export const enquiryStatusSchema = z.object({ status: z.enum(enquiryStatuses) });

export const enquiryNoteSchema = z.object({ note: requiredText("Note", 4000) });
