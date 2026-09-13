import { query } from "../config/database";
import type { AdminUser, PasswordResetToken } from "../models";
import { toCamel } from "./mapper";

const columns = `id, name, email, password_hash, role, avatar_url, is_active, last_login_at, created_at, updated_at`;

export const adminUserRepository = {
  async findByEmail(email: string): Promise<AdminUser | null> {
    const { rows } = await query(`SELECT ${columns} FROM admin_users WHERE lower(email) = lower($1)`, [email]);
    return rows[0] ? toCamel<AdminUser>(rows[0]) : null;
  },

  async findById(id: number): Promise<AdminUser | null> {
    const { rows } = await query(`SELECT ${columns} FROM admin_users WHERE id = $1`, [id]);
    return rows[0] ? toCamel<AdminUser>(rows[0]) : null;
  },

  async touchLastLogin(id: number): Promise<void> {
    await query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [id]);
  },

  async updateProfile(id: number, input: { name: string; email: string; avatarUrl: string | null }): Promise<AdminUser | null> {
    const { rowCount } = await query(`UPDATE admin_users SET name = $2, email = $3, avatar_url = $4 WHERE id = $1`, [
      id,
      input.name,
      input.email,
      input.avatarUrl,
    ]);
    return rowCount ? this.findById(id) : null;
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await query(`UPDATE admin_users SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
  },

  /* ------------------------------------------------- password reset tokens */
  async createResetToken(adminUserId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    // Only the newest token may be used.
    await query(`UPDATE password_reset_tokens SET used_at = now() WHERE admin_user_id = $1 AND used_at IS NULL`, [adminUserId]);
    await query(`INSERT INTO password_reset_tokens (admin_user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, [
      adminUserId,
      tokenHash,
      expiresAt,
    ]);
  },

  async findResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    const { rows } = await query(
      `SELECT id, admin_user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE token_hash = $1`,
      [tokenHash],
    );
    return rows[0] ? toCamel<PasswordResetToken>(rows[0]) : null;
  },

  async consumeResetTokens(adminUserId: number): Promise<void> {
    await query(`UPDATE password_reset_tokens SET used_at = now() WHERE admin_user_id = $1 AND used_at IS NULL`, [adminUserId]);
  },
};
