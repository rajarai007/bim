import { rateLimit } from "express-rate-limit";
import type { RequestHandler } from "express";
import { env } from "../config/env";

function limiter(windowMs: number, limit: number, message: string): RequestHandler {
  if (!env.rateLimitEnabled) return (_req, _res, next) => next();
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message, errors: [] },
  });
}

/** Brute-force protection for the admin login. */
export const loginRateLimit = limiter(15 * 60 * 1000, 10, "Too many login attempts, please try again in 15 minutes");

/** Limits password-reset requests / attempts per IP. */
export const passwordResetRateLimit = limiter(15 * 60 * 1000, 5, "Too many password reset requests, please try again in 15 minutes");

/** Spam protection for the public enquiry form. */
export const enquiryRateLimit = limiter(10 * 60 * 1000, 8, "Too many enquiries submitted, please try again later");

/** General API ceiling. */
export const apiRateLimit = limiter(60 * 1000, 300, "Too many requests, please slow down");
