import { z } from "zod";
import { booleanQuery, optionalText, optionalUrl, paginationQuery, requiredText, slugSchema, stringList } from "./common";

/* ------------------------------------------------------------ categories */
export const categoryIcons = ["box", "activity", "wind", "home", "layers", "compass", "monitor", "briefcase"] as const;

export const categoryBodySchema = z.object({
  slug: slugSchema,
  name: requiredText("Name", 120),
  badge: requiredText("Badge", 40),
  summary: requiredText("Summary", 500),
  tagline: requiredText("Tagline", 300),
  description: requiredText("Description", 2000),
  icon: z.enum(categoryIcons).default("box"),
  footerLabel: requiredText("Footer label", 120),
  overviewTitle: requiredText("Overview title", 120),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.coerce.number().int().min(0).optional(),
});
export type CategoryBody = z.infer<typeof categoryBodySchema>;

/* --------------------------------------------------------------- courses */
export const syllabusModuleSchema = z.object({
  title: requiredText("Module title", 200),
  description: z.string().trim().max(2000).default(""),
});

export const courseStatuses = ["active", "draft", "inactive"] as const;
export const trainingModes = ["Offline Lab", "Hybrid (Online + Offline)", "Online Live"] as const;

export const courseBodySchema = z.object({
  categoryId: z.coerce.number().int().positive({ message: "Category is required" }),
  slug: slugSchema,
  title: requiredText("Title", 160),
  shortDescription: requiredText("Short description", 600),
  fullDescription: optionalText(10_000),
  eligibility: optionalText(1000),
  whoShouldJoin: optionalText(1000),
  outcomes: stringList,
  syllabus: z.array(syllabusModuleSchema).max(50).default([]),
  software: stringList,
  careers: stringList,
  durationWeeks: z.coerce.number().int().min(1, "Duration is required").max(104),
  trainingMode: z.string().trim().min(1).max(60).default("Offline Lab"),
  batchLocation: optionalText(160),
  imageUrl: optionalUrl(),
  imageAlt: optionalText(255),
  status: z.enum(courseStatuses).default("draft"),
  isFeatured: z.boolean().default(false),
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});
export type CourseBody = z.infer<typeof courseBodySchema>;

export const courseFeaturedSchema = z.object({ isFeatured: z.boolean() });

export const adminCourseListQuery = paginationQuery.extend({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  status: z.enum(courseStatuses).optional(),
});

export const publicCourseListQuery = z.object({
  category: z.string().trim().max(120).optional(),
  featured: booleanQuery,
});

/* -------------------------------------------------------------- trainers */
export const trainerBodySchema = z.object({
  name: requiredText("Name", 120),
  role: requiredText("Role", 120),
  homeRole: optionalText(120),
  specialization: optionalText(160),
  bio: requiredText("Bio", 1000),
  experienceYears: z.coerce.number().int().min(0).max(80),
  tags: stringList,
  imageUrl: optionalUrl(),
  imageAlt: optionalText(255),
  linkedinUrl: optionalUrl(),
  showOnHome: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type TrainerBody = z.infer<typeof trainerBodySchema>;

export const trainerListQuery = z.object({ home: booleanQuery });

/* ---------------------------------------------------------- testimonials */
export const testimonialBodySchema = z.object({
  name: requiredText("Name", 120),
  program: requiredText("Program", 160),
  quote: requiredText("Quote", 2000),
  rating: z.coerce.number().int().min(1).max(5),
  avatarUrl: optionalUrl(),
  status: z.enum(["published", "pending"]).default("pending"),
});
export type TestimonialBody = z.infer<typeof testimonialBodySchema>;

/* -------------------------------------------------------------- projects */
export const projectBodySchema = z.object({
  categoryId: z.coerce.number().int().positive({ message: "Category is required" }),
  title: requiredText("Title", 160),
  description: requiredText("Description", 1000),
  software: stringList,
  imageUrl: optionalUrl(),
  imageAlt: optionalText(255),
  showOnHome: z.boolean().default(false),
  status: z.enum(["published", "draft"]).default("draft"),
});
export type ProjectBody = z.infer<typeof projectBodySchema>;

export const projectListQuery = z.object({ home: booleanQuery });

/* ------------------------------------------------------------------ faqs */
export const faqBodySchema = z.object({
  faqCategoryId: z.coerce.number().int().positive({ message: "Category is required" }),
  question: requiredText("Question", 255),
  answer: requiredText("Answer", 4000),
  showOnHome: z.boolean().default(false),
  status: z.enum(["published", "draft"]).default("draft"),
});
export type FaqBody = z.infer<typeof faqBodySchema>;

export const faqListQuery = z.object({ home: booleanQuery });

export const searchQuery = z.object({ q: z.string().trim().max(120).optional() });
