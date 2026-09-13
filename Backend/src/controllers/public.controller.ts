import type { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { courseService } from "../services/course.service";
import { enquiryService } from "../services/enquiry.service";
import { faqService } from "../services/faq.service";
import { projectService } from "../services/project.service";
import { settingsService } from "../services/settings.service";
import { testimonialService } from "../services/testimonial.service";
import { trainerService } from "../services/trainer.service";
import { sendCreated, sendSuccess } from "../utils/response";
import type { CreateEnquiryInput } from "../validators/enquiry.validator";

export const publicController = {
  async settings(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.getPublic());
  },

  async pages(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.listPages());
  },

  async categories(_req: Request, res: Response) {
    sendSuccess(res, await categoryService.listPublic());
  },

  async category(req: Request, res: Response) {
    sendSuccess(res, await categoryService.getPublicBySlug(req.params.slug as string));
  },

  async courses(_req: Request, res: Response) {
    const { category, featured } = res.locals.query as { category?: string; featured?: boolean };
    sendSuccess(res, await courseService.listPublic({ category, featured }));
  },

  async course(req: Request, res: Response) {
    sendSuccess(res, await courseService.getPublicBySlug(req.params.slug as string));
  },

  async trainers(_req: Request, res: Response) {
    const { home } = res.locals.query as { home?: boolean };
    sendSuccess(res, await trainerService.listPublic({ home }));
  },

  async testimonials(_req: Request, res: Response) {
    sendSuccess(res, await testimonialService.listPublic());
  },

  async projects(_req: Request, res: Response) {
    const { home } = res.locals.query as { home?: boolean };
    sendSuccess(res, await projectService.listPublic({ home }));
  },

  async faqCategories(_req: Request, res: Response) {
    sendSuccess(res, await faqService.listCategories());
  },

  async faqs(_req: Request, res: Response) {
    const { home } = res.locals.query as { home?: boolean };
    sendSuccess(res, await faqService.listPublic({ home }));
  },

  async createEnquiry(req: Request, res: Response) {
    const result = await enquiryService.create(req.body as CreateEnquiryInput);
    sendCreated(res, result, "Thank you — your enquiry has been received");
  },
};
