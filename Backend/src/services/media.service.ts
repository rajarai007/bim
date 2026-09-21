import crypto from "node:crypto";
import { mediaRepository } from "../repositories/media.repository";
import { uploadStorage } from "./upload-storage";
import { ApiError } from "../utils/api-error";

/** Images for the catalogue plus PDF documents (course syllabus downloads). */
export const allowedUploadTypes: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export const mediaService = {
  async list() {
    return mediaRepository.findAll();
  },

  /** Persists an uploaded buffer as `/uploads/YYYY/MM/<random>.<ext>` (disk or database, see upload-storage) and records it. */
  async upload(file: { originalname: string; mimetype: string; buffer: Buffer; size: number }, uploadedBy: number | null) {
    const ext = allowedUploadTypes[file.mimetype];
    if (!ext) throw ApiError.unprocessable("Unsupported file type", [{ field: "file", message: "Only PNG, JPG, WEBP, SVG images or PDF documents are allowed" }]);

    const now = new Date();
    const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const name = `${crypto.randomBytes(12).toString("hex")}${ext}`;
    await uploadStorage.put(`${folder}/${name}`, file);

    return mediaRepository.create({
      fileName: file.originalname.slice(0, 255),
      url: `/uploads/${folder}/${name}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy,
    });
  },

  async delete(id: number) {
    const media = await mediaRepository.findById(id);
    if (!media) throw ApiError.notFound("Media file not found");
    if ((media.usageCount ?? 0) > 0) {
      throw ApiError.conflict(`"${media.fileName}" is used by ${media.usageCount} record(s) and cannot be deleted`);
    }
    await mediaRepository.delete(id);
    if (media.url.startsWith("/uploads/")) await uploadStorage.remove(media.url.slice("/uploads/".length));
  },
};
