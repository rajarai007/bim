import { Router } from "express";
import { publicController } from "../controllers/public.controller";
import { enquiryRateLimit } from "../middleware/rate-limit";
import { validate } from "../middleware/validate";
import { faqListQuery, projectListQuery, publicCourseListQuery, trainerListQuery } from "../validators/catalog.validator";
import { slugParam } from "../validators/common";
import { createEnquirySchema } from "../validators/enquiry.validator";

/** Read-only content for the client website + enquiry submission. */
export const publicRoutes = Router();

publicRoutes.get("/settings", publicController.settings);
publicRoutes.get("/pages", publicController.pages);
publicRoutes.get("/categories", publicController.categories);
publicRoutes.get("/categories/:slug", validate({ params: slugParam }), publicController.category);
publicRoutes.get("/courses", validate({ query: publicCourseListQuery }), publicController.courses);
publicRoutes.get("/courses/:slug", validate({ params: slugParam }), publicController.course);
publicRoutes.get("/trainers", validate({ query: trainerListQuery }), publicController.trainers);
publicRoutes.get("/testimonials", publicController.testimonials);
publicRoutes.get("/projects", validate({ query: projectListQuery }), publicController.projects);
publicRoutes.get("/faq-categories", publicController.faqCategories);
publicRoutes.get("/faqs", validate({ query: faqListQuery }), publicController.faqs);
publicRoutes.post("/enquiries", enquiryRateLimit, validate({ body: createEnquirySchema }), publicController.createEnquiry);
