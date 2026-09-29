import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";

/** Admin areas whose writes never change what the public site renders. */
const PRIVATE_AREAS = /^\/(enquiries|media)(\/|$)/;

/** Rapid saves (bulk edits, featured toggles) collapse into one revalidation. */
const DEBOUNCE_MS = 500;

let timer: NodeJS.Timeout | undefined;

function scheduleRevalidation(url: string, secret: string) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    })
      .then((res) => {
        if (!res.ok) logger.warn({ status: res.status }, "public site refused cache revalidation");
      })
      .catch((err: unknown) => logger.warn({ err }, "public site cache revalidation failed"));
  }, DEBOUNCE_MS);
  timer.unref();
}

/**
 * The public site serves cached pages (ISR). After a successful admin write,
 * ask it to expire that cache so the change shows on the next visit rather
 * than after the one-minute refresh window. A no-op unless both
 * SITE_REVALIDATE_URL and REVALIDATE_SECRET are configured.
 */
export function revalidateSiteOnWrite(req: Request, res: Response, next: NextFunction) {
  const url = env.SITE_REVALIDATE_URL;
  const secret = env.REVALIDATE_SECRET;
  if (url && secret && req.method !== "GET" && req.method !== "HEAD" && !PRIVATE_AREAS.test(req.path)) {
    res.on("finish", () => {
      if (res.statusCode < 400) scheduleRevalidation(url, secret);
    });
  }
  next();
}
