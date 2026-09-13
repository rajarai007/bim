import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/token.service";
import { adminUserRepository } from "../repositories/admin-user.repository";
import { ApiError } from "../utils/api-error";
import type { AdminRole } from "../types";

/** Requires a valid `Authorization: Bearer <jwt>` header for an active admin. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
  if (!token) throw ApiError.unauthorized();

  const payload = verifyAccessToken(token);
  const user = await adminUserRepository.findById(Number(payload.sub));
  if (!user || !user.isActive) throw ApiError.unauthorized("Session is no longer valid");

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl };
  req.tokenExp = payload.exp;
  next();
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}
