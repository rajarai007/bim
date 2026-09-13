import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";
import { uploadFileRepository } from "../repositories/upload-file.repository";

/**
 * Where admin uploads live. Paths are relative to `/uploads/`
 * (e.g. `2026/09/abc123.png`).
 *
 *  - `disk`: files under `UPLOAD_DIR`, served by `express.static` (local dev, VPS).
 *  - `db`:   bytes in the `upload_files` table, served by `serveStoredUploads`.
 *            Use this on hosts whose filesystem is wiped on redeploy.
 */
export type UploadStorage = {
  put(relPath: string, file: { buffer: Buffer; mimetype: string; size: number }): Promise<void>;
  /** Only the `db` backend answers here; `disk` returns null so the request falls through to `express.static`. */
  get(relPath: string): Promise<{ content: Buffer; mimeType: string; sizeBytes: number; createdAt: Date } | null>;
  remove(relPath: string): Promise<void>;
};

/** `YYYY/MM/name.ext` style paths only — no absolute paths, dot segments or odd characters. */
export function isSafeUploadPath(relPath: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/.test(relPath);
}

const diskStorage: UploadStorage = {
  async put(relPath, file) {
    const target = path.join(env.uploadDir, relPath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.buffer);
  },
  async get() {
    return null;
  },
  async remove(relPath) {
    const target = path.resolve(env.uploadDir, relPath);
    // Never delete outside the upload directory.
    if (target.startsWith(env.uploadDir)) await fs.rm(target, { force: true });
  },
};

const dbStorage: UploadStorage = {
  async put(relPath, file) {
    await uploadFileRepository.create({ path: relPath, mimeType: file.mimetype, sizeBytes: file.size, content: file.buffer });
  },
  async get(relPath) {
    return uploadFileRepository.findByPath(relPath);
  },
  async remove(relPath) {
    await uploadFileRepository.delete(relPath);
  },
};

export const uploadStorage: UploadStorage = env.uploadStorage === "db" ? dbStorage : diskStorage;
