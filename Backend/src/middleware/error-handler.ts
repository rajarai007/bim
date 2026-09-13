import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

type PgError = Error & { code?: string; constraint?: string; detail?: string };

function fieldErrorsFromZod(err: ZodError) {
  return err.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
}

/** Translates PostgreSQL constraint violations into 409 / 422 responses. */
function fromPgError(err: PgError): ApiError | null {
  switch (err.code) {
    case "23505": {
      const field = err.constraint?.replace(/^[a-z_]+?_(.+?)_(key|idx)$/i, "$1") ?? "record";
      return ApiError.conflict(`A record with the same ${field} already exists`, [
        { field, message: "Must be unique" },
      ]);
    }
    case "23503":
      return ApiError.conflict("This record is referenced by other records and cannot be changed");
    case "23514":
    case "22001":
    case "22P02":
      return ApiError.unprocessable("Invalid value for one or more fields");
    default:
      return null;
  }
}

type BodyParserError = Error & { type: string; status: number; expose?: boolean };

/** body-parser rejects a request with an `http-errors` instance carrying a `type` and a 4xx status. */
function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    typeof err === "object" &&
    err !== null &&
    typeof (err as { type?: unknown }).type === "string" &&
    typeof (err as { status?: unknown }).status === "number" &&
    (err as { status: number }).status >= 400 &&
    (err as { status: number }).status < 500
  );
}

/** Maps malformed / oversized / unsupported request bodies onto the JSON envelope instead of a 500. */
function fromBodyParserError(err: BodyParserError): ApiError {
  switch (err.type) {
    case "entity.parse.failed":
      return ApiError.badRequest("Malformed JSON body");
    case "entity.too.large":
      return new ApiError(413, "Request body is too large");
    case "encoding.unsupported":
    case "charset.unsupported":
      return new ApiError(415, "Unsupported request encoding");
    default:
      return new ApiError(err.status, err.expose ? err.message : "Invalid request body");
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found`, errors: [] });
}

// Express 5 forwards rejected promises here automatically.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = ApiError.unprocessable("Validation failed", fieldErrorsFromZod(err));
  } else if (err instanceof MulterError) {
    apiError =
      err.code === "LIMIT_FILE_SIZE"
        ? ApiError.unprocessable(`File is too large (max ${env.MAX_UPLOAD_MB} MB)`, [{ field: "file", message: "Too large" }])
        : ApiError.badRequest(err.message, [{ field: err.field ?? "file", message: err.message }]);
  } else if (isBodyParserError(err)) {
    apiError = fromBodyParserError(err);
  } else if (typeof err === "object" && err !== null && "code" in err && fromPgError(err as PgError)) {
    apiError = fromPgError(err as PgError)!;
  } else {
    logger.error({ err, url: req.originalUrl, method: req.method }, "Unhandled error");
    apiError = new ApiError(500, env.isProduction ? "Internal server error" : (err as Error)?.message ?? "Internal server error");
  }

  if (apiError.status >= 500) {
    logger.error({ err, url: req.originalUrl }, apiError.message);
  }

  res.status(apiError.status).json({ success: false, message: apiError.message, errors: apiError.errors });
}
