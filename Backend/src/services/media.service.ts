import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env";
import { mediaRepository } from "../repositories/media.repository";
import { ApiError } from "../utils/api-error";

export const allowedImageTypes: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export const mediaService = {
  async list() {
    return mediaRepository.findAll();
  },

  /** Persists an uploaded buffer under `uploads/YYYY/MM/<random>.<ext>` and records it. */
  async upload(file: { originalname: string; mimetype: string; buffer: Buffer; size: number }, uploadedBy: number | null) {
    const ext = allowedImageTypes[file.mimetype];
    if (!ext) throw ApiError.unprocessable("Unsupported file type", [{ field: "file", message: "Only PNG, JPG, WEBP or SVG images are allowed" }]);

    const now = new Date();
    const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const name = `${crypto.randomBytes(12).toString("hex")}${ext}`;
    const dir = path.join(env.uploadDir, folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), file.buffer);

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
    if (media.url.startsWith("/uploads/")) {
      const target = path.resolve(env.uploadDir, `.${media.url.slice("/uploads".length)}`);
      // Never delete outside the upload directory.
      if (target.startsWith(env.uploadDir)) await fs.rm(target, { force: true });
    }
  },
};
