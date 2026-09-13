import type { Response } from "express";

export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200): void {
  res.status(status).json({ success: true, data, ...(message ? { message } : {}) });
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

export function paginate(page: number, pageSize: number, total: number): Pagination {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
