import type { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { courseService } from "../services/course.service";
import { dashboardService } from "../services/dashboard.service";
import { enquiryService } from "../services/enquiry.service";
import { faqService } from "../services/faq.service";
import { mediaService } from "../services/media.service";
import { projectService } from "../services/project.service";
import { settingsService } from "../services/settings.service";
import { testimonialService } from "../services/testimonial.service";
import { trainerService } from "../services/trainer.service";
import { ApiError } from "../utils/api-error";
import { sendCreated, sendSuccess } from "../utils/response";
import type { CategoryBody, CourseBody, FaqBody, ProjectBody, TestimonialBody, TrainerBody } from "../validators/catalog.validator";
import type { EnquiryStatus } from "../types";
import type { SettingsPatch } from "../validators/settings.validator";

const id = (req: Request) => Number(req.params.id);
const q = (res: Response) => (res.locals.query as { q?: string } | undefined)?.q;

export const adminController = {
  /* -------------------------------------------------------- dashboard */
  async dashboard(_req: Request, res: Response) {
    sendSuccess(res, await dashboardService.get());
  },

  /* ---------------------------------------------------------- courses */
  async listCourses(_req: Request, res: Response) {
    sendSuccess(res, await courseService.listAdmin(res.locals.query));
  },
  async getCourse(req: Request, res: Response) {
    sendSuccess(res, await courseService.getAdmin(id(req)));
  },
  async createCourse(req: Request, res: Response) {
    sendCreated(res, await courseService.create(req.body as CourseBody), "Course created");
  },
  async updateCourse(req: Request, res: Response) {
    sendSuccess(res, await courseService.update(id(req), req.body as CourseBody), "Course updated");
  },
  async setCourseFeatured(req: Request, res: Response) {
    const { isFeatured } = req.body as { isFeatured: boolean };
    sendSuccess(res, await courseService.setFeatured(id(req), isFeatured), isFeatured ? "Course marked as featured" : "Course removed from featured");
  },
  async deleteCourse(req: Request, res: Response) {
    await courseService.delete(id(req));
    sendSuccess(res, null, "Course deleted");
  },

  /* ------------------------------------------------------- categories */
  async listCategories(_req: Request, res: Response) {
    sendSuccess(res, await categoryService.listAdmin());
  },
  async getCategory(req: Request, res: Response) {
    sendSuccess(res, await categoryService.getAdmin(id(req)));
  },
  async createCategory(req: Request, res: Response) {
    sendCreated(res, await categoryService.create(req.body as CategoryBody), "Category created");
  },
  async updateCategory(req: Request, res: Response) {
    sendSuccess(res, await categoryService.update(id(req), req.body as CategoryBody), "Category updated");
  },
  async deleteCategory(req: Request, res: Response) {
    await categoryService.delete(id(req));
    sendSuccess(res, null, "Category deleted");
  },

  /* --------------------------------------------------------- trainers */
  async listTrainers(_req: Request, res: Response) {
    sendSuccess(res, await trainerService.listAdmin(q(res)));
  },
  async getTrainer(req: Request, res: Response) {
    sendSuccess(res, await trainerService.getAdmin(id(req)));
  },
  async createTrainer(req: Request, res: Response) {
    sendCreated(res, await trainerService.create(req.body as TrainerBody), "Trainer created");
  },
  async updateTrainer(req: Request, res: Response) {
    sendSuccess(res, await trainerService.update(id(req), req.body as TrainerBody), "Trainer updated");
  },
  async deleteTrainer(req: Request, res: Response) {
    await trainerService.delete(id(req));
    sendSuccess(res, null, "Trainer deleted");
  },

  /* ----------------------------------------------------- testimonials */
  async listTestimonials(_req: Request, res: Response) {
    sendSuccess(res, await testimonialService.listAdmin(q(res)));
  },
  async getTestimonial(req: Request, res: Response) {
    sendSuccess(res, await testimonialService.getAdmin(id(req)));
  },
  async createTestimonial(req: Request, res: Response) {
    sendCreated(res, await testimonialService.create(req.body as TestimonialBody), "Testimonial created");
  },
  async updateTestimonial(req: Request, res: Response) {
    sendSuccess(res, await testimonialService.update(id(req), req.body as TestimonialBody), "Testimonial updated");
  },
  async deleteTestimonial(req: Request, res: Response) {
    await testimonialService.delete(id(req));
    sendSuccess(res, null, "Testimonial deleted");
  },

  /* --------------------------------------------------------- projects */
  async listProjects(_req: Request, res: Response) {
    sendSuccess(res, await projectService.listAdmin(q(res)));
  },
  async getProject(req: Request, res: Response) {
    sendSuccess(res, await projectService.getAdmin(id(req)));
  },
  async createProject(req: Request, res: Response) {
    sendCreated(res, await projectService.create(req.body as ProjectBody), "Project created");
  },
  async updateProject(req: Request, res: Response) {
    sendSuccess(res, await projectService.update(id(req), req.body as ProjectBody), "Project updated");
  },
  async deleteProject(req: Request, res: Response) {
    await projectService.delete(id(req));
    sendSuccess(res, null, "Project deleted");
  },

  /* ------------------------------------------------------------- faqs */
  async listFaqs(_req: Request, res: Response) {
    sendSuccess(res, await faqService.listAdmin(q(res)));
  },
  async getFaq(req: Request, res: Response) {
    sendSuccess(res, await faqService.getAdmin(id(req)));
  },
  async createFaq(req: Request, res: Response) {
    sendCreated(res, await faqService.create(req.body as FaqBody), "FAQ created");
  },
  async updateFaq(req: Request, res: Response) {
    sendSuccess(res, await faqService.update(id(req), req.body as FaqBody), "FAQ updated");
  },
  async deleteFaq(req: Request, res: Response) {
    await faqService.delete(id(req));
    sendSuccess(res, null, "FAQ deleted");
  },

  /* -------------------------------------------------------- enquiries */
  async listEnquiries(_req: Request, res: Response) {
    sendSuccess(res, await enquiryService.list(res.locals.query));
  },
  async enquiryStats(_req: Request, res: Response) {
    sendSuccess(res, await enquiryService.stats());
  },
  async exportEnquiries(_req: Request, res: Response) {
    const csv = await enquiryService.exportCsv(res.locals.query);
    res
      .status(200)
      .setHeader("Content-Type", "text/csv; charset=utf-8")
      .setHeader("Content-Disposition", `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`)
      .send(csv);
  },
  async getEnquiry(req: Request, res: Response) {
    sendSuccess(res, await enquiryService.get(id(req)));
  },
  async updateEnquiryStatus(req: Request, res: Response) {
    const { status } = req.body as { status: EnquiryStatus };
    sendSuccess(res, await enquiryService.updateStatus(id(req), status), "Status updated");
  },
  async addEnquiryNote(req: Request, res: Response) {
    const { note } = req.body as { note: string };
    sendCreated(res, await enquiryService.addNote(id(req), req.user!.id, note), "Note added");
  },
  async deleteEnquiry(req: Request, res: Response) {
    await enquiryService.delete(id(req));
    sendSuccess(res, null, "Enquiry deleted");
  },

  /* --------------------------------------------------------- settings */
  async getSettings(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.getAdmin());
  },
  async updateSettings(req: Request, res: Response) {
    sendSuccess(res, await settingsService.update(req.body as SettingsPatch), "Settings saved");
  },
  async listPages(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.listPages());
  },
  async updatePageMeta(req: Request, res: Response) {
    const body = req.body as { metaTitle: string | null; metaDescription: string | null };
    sendSuccess(res, await settingsService.updatePageMeta(id(req), body), "SEO settings saved");
  },

  /* ------------------------------------------------------------ media */
  async listMedia(_req: Request, res: Response) {
    sendSuccess(res, await mediaService.list());
  },
  async uploadMedia(req: Request, res: Response) {
    if (!req.file) throw ApiError.unprocessable("Validation failed", [{ field: "file", message: "An image file is required" }]);
    sendCreated(res, await mediaService.upload(req.file, req.user!.id), "File uploaded");
  },
  async deleteMedia(req: Request, res: Response) {
    await mediaService.delete(id(req));
    sendSuccess(res, null, "File deleted");
  },
};
