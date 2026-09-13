import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/**
 * Validates and *replaces* `req.body` / `req.params` with the parsed values,
 * so downstream code only ever sees typed, coerced data. Parsed query values
 * are stored on `res.locals.query` because `req.query` is a getter in Express 5.
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    if (schemas.query) res.locals.query = schemas.query.parse(req.query);
    next();
  };
}
