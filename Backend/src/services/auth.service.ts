import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import type { AdminUser } from "../models";
import { adminUserRepository } from "../repositories/admin-user.repository";
import { ApiError } from "../utils/api-error";
import type { AuthUser } from "../types";
import type { LoginInput } from "../validators/auth.validator";
import { mailService } from "./mail.service";
import { reissueAccessToken, signAccessToken } from "./token.service";

export type LoginResult = { token: string; expiresAt: Date; user: AuthUser };

const BCRYPT_ROUNDS = 12;
// Compared against when the user is unknown so response timing stays uniform.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Y0z6Y7r9m6vQF3bT3H4nQ2ZyR2P0K";

export function toAuthUser(user: AdminUser): AuthUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl };
}

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    const user = await adminUserRepository.findByEmail(input.email);
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw ApiError.unauthorized("Invalid email or password");
    if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

    await adminUserRepository.touchLastLogin(user.id);
    const authUser = toAuthUser(user);
    const { token, expiresAt } = signAccessToken(authUser, input.remember);
    return { token, expiresAt, user: authUser };
  },

  async me(id: number): Promise<AuthUser> {
    const user = await adminUserRepository.findById(id);
    if (!user) throw ApiError.unauthorized("Session is no longer valid");
    return toAuthUser(user);
  },

  /** Updates name / email / avatar and returns a re-issued token carrying the new claims. */
  async updateProfile(id: number, tokenExp: number, input: { name: string; email: string; avatarUrl: string | null }): Promise<LoginResult> {
    const existing = await adminUserRepository.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw ApiError.conflict("Another admin already uses this email address", [{ field: "email", message: "Must be unique" }]);
    }
    const updated = await adminUserRepository.updateProfile(id, input);
    if (!updated) throw ApiError.notFound("Admin not found");
    const authUser = toAuthUser(updated);
    const { token, expiresAt } = reissueAccessToken(authUser, tokenExp);
    return { token, expiresAt, user: authUser };
  },

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await adminUserRepository.findById(id);
    if (!user) throw ApiError.unauthorized("Session is no longer valid");
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw ApiError.unprocessable("Validation failed", [{ field: "currentPassword", message: "Current password is incorrect" }]);
    }
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      throw ApiError.unprocessable("Validation failed", [{ field: "newPassword", message: "New password must differ from the current one" }]);
    }
    await adminUserRepository.updatePassword(id, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
    await adminUserRepository.consumeResetTokens(id);
  },

  /**
   * Emails a single-use reset link. Always resolves — the response never
   * reveals whether the address belongs to an account.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await adminUserRepository.findByEmail(email);
    if (!user || !user.isActive) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000);
    await adminUserRepository.createResetToken(user.id, hashToken(token), expiresAt);

    const link = `${env.adminUrl}/reset-password?token=${token}`;
    await mailService.send({
      to: user.email,
      subject: "Reset your BIM Career Academy admin password",
      text: `Hi ${user.name},\n\nUse the link below to choose a new password. It expires in ${env.PASSWORD_RESET_TTL_MINUTES} minutes and can be used once.\n\n${link}\n\nIf you did not request a reset, you can ignore this email.`,
      html: `<p>Hi ${escapeHtml(user.name)},</p><p>Use the link below to choose a new password. It expires in ${env.PASSWORD_RESET_TTL_MINUTES} minutes and can be used once.</p><p><a href="${link}">${link}</a></p><p>If you did not request a reset, you can ignore this email.</p>`,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await adminUserRepository.findResetToken(hashToken(token));
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest("This password reset link is invalid or has expired. Please request a new one.");
    }
    const user = await adminUserRepository.findById(record.adminUserId);
    if (!user || !user.isActive) throw ApiError.badRequest("This password reset link is invalid or has expired. Please request a new one.");

    await adminUserRepository.updatePassword(user.id, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
    await adminUserRepository.consumeResetTokens(user.id);
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
