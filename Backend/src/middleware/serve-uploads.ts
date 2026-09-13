import type { NextFunction, Request, Response } from "express";
import { isSafeUploadPath, uploadStorage } from "../services/upload-storage";

/**
 * Serves `/uploads/*` from the configured storage backend. With `disk` storage
 * this is a no-op and `express.static` (mounted after it) handles the request.
 */
export async function serveStoredUploads(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  let relPath: string;
  try {
    relPath = decodeURIComponent(req.path).replace(/^\/+/, "");
  } catch {
    return next();
  }
  if (!isSafeUploadPath(relPath)) return next();

  try {
    const file = await uploadStorage.get(relPath);
    if (!file) return next();

    // File names are random and never rewritten, so a size+timestamp tag is stable.
    const etag = `"${file.sizeBytes}-${file.createdAt.getTime()}"`;
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.setHeader("Last-Modified", file.createdAt.toUTCString());
    if (req.headers["if-none-match"] === etag) return res.status(304).end();

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.sizeBytes);
    if (req.method === "HEAD") return res.end();
    return res.end(file.content);
  } catch (err) {
    return next(err);
  }
}
