import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import type { AccessTokenPayload, AuthUser } from "../types";

function claims(user: AuthUser) {
  return { email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl };
}

export function signAccessToken(user: AuthUser, remember = false): { token: string; expiresAt: Date } {
  const expiresIn = (remember ? env.JWT_REMEMBER_EXPIRES_IN : env.JWT_EXPIRES_IN) as jwt.SignOptions["expiresIn"];
  const token = jwt.sign(claims(user), env.JWT_SECRET, { subject: String(user.id), expiresIn, algorithm: "HS256" });
  const decoded = jwt.decode(token) as { exp: number };
  return { token, expiresAt: new Date(decoded.exp * 1000) };
}

/** Re-issues a token with refreshed claims but the same expiry (after a profile update). */
export function reissueAccessToken(user: AuthUser, exp: number): { token: string; expiresAt: Date } {
  const token = jwt.sign({ ...claims(user), exp }, env.JWT_SECRET, { subject: String(user.id), algorithm: "HS256" });
  return { token, expiresAt: new Date(exp * 1000) };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as AccessTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw ApiError.unauthorized("Session expired, please sign in again");
    throw ApiError.unauthorized("Invalid session token");
  }
}
