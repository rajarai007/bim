import { logger } from "../config/logger";
import { courseRepository } from "../repositories/course.repository";
import { enquiryRepository } from "../repositories/enquiry.repository";
import type { EnquiryListFilters } from "../repositories/enquiry.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { ApiError } from "../utils/api-error";
import { paginate } from "../utils/response";
import type { EnquiryStatus } from "../types";
import type { CreateEnquiryInput } from "../validators/enquiry.validator";
import { adminEnquiry } from "./serializers";

export const enquiryService = {
  /** Public: create a lead from the contact form or a course page. */
  async create(input: CreateEnquiryInput) {
    let courseId: number | null = null;
    let courseName: string | null = null;
    if (input.courseSlug) {
      const course = await courseRepository.findBySlug(input.courseSlug);
      if (!course) {
        throw ApiError.unprocessable("Validation failed", [{ field: "courseSlug", message: "Unknown course" }]);
      }
      courseId = course.id;
      courseName = course.title;
    }

    const enquiry = await enquiryRepository.create({
      fullName: input.fullName,
      mobile: input.mobile,
      email: input.email,
      courseId,
      courseName,
      qualification: input.qualification,
      experienceLevel: input.experience,
      message: input.message,
      consent: input.consent,
      source: input.source,
    });

    void this.dispatchWebhook(enquiry.id);
    return { id: enquiry.id, status: enquiry.status, createdAt: enquiry.createdAt };
  },

  /** Fire-and-forget CRM sync configured in Settings → Integration API. */
  async dispatchWebhook(enquiryId: number): Promise<void> {
    try {
      const settings = await settingsRepository.get();
      if (!settings?.webhookUrl) return;
      const enquiry = await enquiryRepository.findById(enquiryId);
      if (!enquiry) return;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(settings.webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "enquiry.created", data: enquiry }),
          signal: controller.signal,
        });
        if (!res.ok) logger.warn({ status: res.status, enquiryId }, "Enquiry webhook responded with an error");
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      logger.warn({ err, enquiryId }, "Enquiry webhook failed");
    }
  },

  async list(filters: EnquiryListFilters) {
    const { items, total } = await enquiryRepository.list(filters);
    return { items: items.map(adminEnquiry), pagination: paginate(filters.page, filters.pageSize, total) };
  },

  async get(id: number) {
    const enquiry = await enquiryRepository.findById(id);
    if (!enquiry) throw ApiError.notFound("Enquiry not found");
    const notes = await enquiryRepository.findNotes(id);
    return { ...adminEnquiry(enquiry), notes };
  },

  async updateStatus(id: number, status: EnquiryStatus) {
    const updated = await enquiryRepository.updateStatus(id, status);
    if (!updated) throw ApiError.notFound("Enquiry not found");
    return adminEnquiry(updated);
  },

  async addNote(id: number, adminUserId: number, note: string) {
    const enquiry = await enquiryRepository.findById(id);
    if (!enquiry) throw ApiError.notFound("Enquiry not found");
    const created = await enquiryRepository.addNote(id, adminUserId, note);
    return { note: created, enquiry: adminEnquiry((await enquiryRepository.findById(id))!) };
  },

  async delete(id: number) {
    const deleted = await enquiryRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Enquiry not found");
  },

  async stats() {
    return enquiryRepository.stats();
  },

  /** CSV export of the (filtered) lead list. */
  async exportCsv(filters: Omit<EnquiryListFilters, "page" | "pageSize">): Promise<string> {
    const rows = await enquiryRepository.findAll(filters);
    const header = ["ID", "Name", "Phone", "Email", "Course", "Qualification", "Experience", "Message", "Status", "Source", "Received At", "Latest Note"];
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = rows.map((e) =>
      [
        e.id, e.fullName, e.mobile, e.email, e.courseName, e.qualification, e.experienceLevel, e.message, e.status,
        e.source, e.createdAt.toISOString(), e.latestNote?.note ?? "",
      ]
        .map(escape)
        .join(","),
    );
    return [header.join(","), ...lines].join("\r\n");
  },
};
