import { Router } from "express";
import multer from "multer";
import { adminController } from "../controllers/admin.controller";
import { env } from "../config/env";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  adminCourseListQuery,
  categoryBodySchema,
  courseBodySchema,
  courseFeaturedSchema,
  faqBodySchema,
  projectBodySchema,
  searchQuery,
  testimonialBodySchema,
  trainerBodySchema,
} from "../validators/catalog.validator";
import { idParam } from "../validators/common";
import { enquiryExportQuery, enquiryListQuery, enquiryNoteSchema, enquiryStatusSchema } from "../validators/enquiry.validator";
import { pageMetaSchema, settingsPatchSchema } from "../validators/settings.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
});

/** Everything under /admin requires a signed-in admin. */
export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

adminRoutes.get("/dashboard", adminController.dashboard);

adminRoutes.get("/courses", validate({ query: adminCourseListQuery }), adminController.listCourses);
adminRoutes.post("/courses", validate({ body: courseBodySchema }), adminController.createCourse);
adminRoutes.get("/courses/:id", validate({ params: idParam }), adminController.getCourse);
adminRoutes.put("/courses/:id", validate({ params: idParam, body: courseBodySchema }), adminController.updateCourse);
adminRoutes.patch("/courses/:id/featured", validate({ params: idParam, body: courseFeaturedSchema }), adminController.setCourseFeatured);
adminRoutes.delete("/courses/:id", validate({ params: idParam }), adminController.deleteCourse);

adminRoutes.get("/categories", adminController.listCategories);
adminRoutes.post("/categories", validate({ body: categoryBodySchema }), adminController.createCategory);
adminRoutes.get("/categories/:id", validate({ params: idParam }), adminController.getCategory);
adminRoutes.put("/categories/:id", validate({ params: idParam, body: categoryBodySchema }), adminController.updateCategory);
adminRoutes.delete("/categories/:id", validate({ params: idParam }), adminController.deleteCategory);

adminRoutes.get("/trainers", validate({ query: searchQuery }), adminController.listTrainers);
adminRoutes.post("/trainers", validate({ body: trainerBodySchema }), adminController.createTrainer);
adminRoutes.get("/trainers/:id", validate({ params: idParam }), adminController.getTrainer);
adminRoutes.put("/trainers/:id", validate({ params: idParam, body: trainerBodySchema }), adminController.updateTrainer);
adminRoutes.delete("/trainers/:id", validate({ params: idParam }), adminController.deleteTrainer);

adminRoutes.get("/testimonials", validate({ query: searchQuery }), adminController.listTestimonials);
adminRoutes.post("/testimonials", validate({ body: testimonialBodySchema }), adminController.createTestimonial);
adminRoutes.get("/testimonials/:id", validate({ params: idParam }), adminController.getTestimonial);
adminRoutes.put("/testimonials/:id", validate({ params: idParam, body: testimonialBodySchema }), adminController.updateTestimonial);
adminRoutes.delete("/testimonials/:id", validate({ params: idParam }), adminController.deleteTestimonial);

adminRoutes.get("/projects", validate({ query: searchQuery }), adminController.listProjects);
adminRoutes.post("/projects", validate({ body: projectBodySchema }), adminController.createProject);
adminRoutes.get("/projects/:id", validate({ params: idParam }), adminController.getProject);
adminRoutes.put("/projects/:id", validate({ params: idParam, body: projectBodySchema }), adminController.updateProject);
adminRoutes.delete("/projects/:id", validate({ params: idParam }), adminController.deleteProject);

adminRoutes.get("/faqs", validate({ query: searchQuery }), adminController.listFaqs);
adminRoutes.post("/faqs", validate({ body: faqBodySchema }), adminController.createFaq);
adminRoutes.get("/faqs/:id", validate({ params: idParam }), adminController.getFaq);
adminRoutes.put("/faqs/:id", validate({ params: idParam, body: faqBodySchema }), adminController.updateFaq);
adminRoutes.delete("/faqs/:id", validate({ params: idParam }), adminController.deleteFaq);

adminRoutes.get("/enquiries", validate({ query: enquiryListQuery }), adminController.listEnquiries);
adminRoutes.get("/enquiries/stats", adminController.enquiryStats);
adminRoutes.get("/enquiries/export", validate({ query: enquiryExportQuery }), adminController.exportEnquiries);
adminRoutes.get("/enquiries/:id", validate({ params: idParam }), adminController.getEnquiry);
adminRoutes.patch("/enquiries/:id/status", validate({ params: idParam, body: enquiryStatusSchema }), adminController.updateEnquiryStatus);
adminRoutes.post("/enquiries/:id/notes", validate({ params: idParam, body: enquiryNoteSchema }), adminController.addEnquiryNote);
adminRoutes.delete("/enquiries/:id", validate({ params: idParam }), adminController.deleteEnquiry);

adminRoutes.get("/settings", adminController.getSettings);
adminRoutes.patch("/settings", validate({ body: settingsPatchSchema }), adminController.updateSettings);
adminRoutes.get("/pages", adminController.listPages);
adminRoutes.patch("/pages/:id", validate({ params: idParam, body: pageMetaSchema }), adminController.updatePageMeta);

adminRoutes.get("/media", adminController.listMedia);
adminRoutes.post("/media", upload.single("file"), adminController.uploadMedia);
adminRoutes.delete("/media/:id", validate({ params: idParam }), adminController.deleteMedia);
