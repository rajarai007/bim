import { describe, expect, it, beforeAll, afterAll } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ADMIN_EMAIL, ADMIN_PASSWORD, api } from "./helpers";
import { mailService } from "../src/services/mail.service";
import { pool } from "../src/config/database";

const login = (email: string, password: string) => api().post("/api/v1/auth/login").send({ email, password });

let token: string;
let originalName: string;

beforeAll(async () => {
  const res = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  token = res.body.data.token;
  originalName = res.body.data.user.name;
});

afterAll(async () => {
  // Leave the seeded admin exactly as other test files expect it, even if a test aborted mid-way.
  await pool.query(
    `UPDATE admin_users SET name = $1, email = $2, password_hash = $3, avatar_url = '/images/avatar-admin.png'
     WHERE lower(email) IN (lower($2), 'renamed.admin@example.com')`,
    [originalName, ADMIN_EMAIL, await bcrypt.hash(ADMIN_PASSWORD, 10)],
  );
  await pool.query(`DELETE FROM admin_users WHERE email = 'other.admin@example.com'`);
});

describe("admin profile", () => {
  it("GET /auth/me includes the avatar", async () => {
    const res = await api().get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: ADMIN_EMAIL, avatarUrl: "/images/avatar-admin.png" });
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("validates profile updates", async () => {
    const res = await api().patch("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).send({ name: "A", email: "nope" });
    expect(res.status).toBe(422);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toEqual(expect.arrayContaining(["name", "email"]));
  });

  it("updates name, email and avatar and re-issues a token with the same expiry", async () => {
    const before = jwt.decode(token) as { exp: number };
    const res = await api()
      .patch("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Renamed Admin", email: "Renamed.Admin@example.com", avatarUrl: "/images/person-01.png" });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ name: "Renamed Admin", email: "renamed.admin@example.com", avatarUrl: "/images/person-01.png" });
    const after = jwt.decode(res.body.data.token) as { exp: number; name: string; avatarUrl: string };
    expect(after.exp).toBe(before.exp);
    expect(after.name).toBe("Renamed Admin");
    expect(after.avatarUrl).toBe("/images/person-01.png");

    // the new token works and the old one still identifies the same (updated) user
    const me = await api().get("/api/v1/auth/me").set("Authorization", `Bearer ${res.body.data.token}`);
    expect(me.body.data.name).toBe("Renamed Admin");
    // login with the new email works
    expect((await login("renamed.admin@example.com", ADMIN_PASSWORD)).status).toBe(200);

    // restore
    const restore = await api().patch("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).send({ name: originalName, email: ADMIN_EMAIL, avatarUrl: "/images/avatar-admin.png" });
    expect(restore.status).toBe(200);
  });

  it("rejects an email already used by another admin", async () => {
    await pool.query(`INSERT INTO admin_users (name, email, password_hash, role) VALUES ('Other', 'other.admin@example.com', 'x', 'admin') ON CONFLICT DO NOTHING`);
    try {
      const res = await api().patch("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).send({ name: "Admin", email: "OTHER.admin@example.com" });
      expect(res.status).toBe(409);
      expect(res.body.errors[0].field).toBe("email");
    } finally {
      await pool.query(`DELETE FROM admin_users WHERE email = 'other.admin@example.com'`);
    }
  });

  it("requires auth", async () => {
    expect((await api().patch("/api/v1/auth/me").send({ name: "x", email: "x@y.com" })).status).toBe(401);
    expect((await api().patch("/api/v1/auth/password").send({ currentPassword: "a", newPassword: "bbbbbbbb" })).status).toBe(401);
  });
});

describe("change password", () => {
  it("rejects a wrong current password and weak new passwords", async () => {
    const wrong = await api().patch("/api/v1/auth/password").set("Authorization", `Bearer ${token}`).send({ currentPassword: "nope", newPassword: "new-password-1" });
    expect(wrong.status).toBe(422);
    expect(wrong.body.errors[0]).toEqual({ field: "currentPassword", message: "Current password is incorrect" });

    const weak = await api().patch("/api/v1/auth/password").set("Authorization", `Bearer ${token}`).send({ currentPassword: ADMIN_PASSWORD, newPassword: "short" });
    expect(weak.status).toBe(422);
    expect(weak.body.errors[0].field).toBe("newPassword");

    const same = await api().patch("/api/v1/auth/password").set("Authorization", `Bearer ${token}`).send({ currentPassword: ADMIN_PASSWORD, newPassword: ADMIN_PASSWORD });
    expect(same.status).toBe(422);
  });

  it("changes the password and back", async () => {
    const res = await api().patch("/api/v1/auth/password").set("Authorization", `Bearer ${token}`).send({ currentPassword: ADMIN_PASSWORD, newPassword: "temporary-pass-1" });
    expect(res.status).toBe(200);
    expect((await login(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(401);
    const fresh = await login(ADMIN_EMAIL, "temporary-pass-1");
    expect(fresh.status).toBe(200);

    const back = await api().patch("/api/v1/auth/password").set("Authorization", `Bearer ${fresh.body.data.token}`).send({ currentPassword: "temporary-pass-1", newPassword: ADMIN_PASSWORD });
    expect(back.status).toBe(200);
    expect((await login(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(200);
  });
});

describe("forgot / reset password", () => {
  const outboxSize = () => mailService.outbox().length;
  const lastToken = () => {
    const mail = mailService.outbox().at(-1)!;
    return /reset-password\?token=([a-f0-9]{64})/.exec(mail.text)![1]!;
  };

  it("never reveals whether an email exists", async () => {
    const before = outboxSize();
    const res = await api().post("/api/v1/auth/forgot-password").send({ email: "nobody@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account/i);
    expect(outboxSize()).toBe(before);
    expect((await api().post("/api/v1/auth/forgot-password").send({ email: "bad" })).status).toBe(422);
  });

  it("emails a single-use link that resets the password", async () => {
    const before = outboxSize();
    const res = await api().post("/api/v1/auth/forgot-password").send({ email: ADMIN_EMAIL.toUpperCase() });
    expect(res.status).toBe(200);
    expect(outboxSize()).toBe(before + 1);
    const mail = mailService.outbox().at(-1)!;
    expect(mail.to).toBe(ADMIN_EMAIL);
    expect(mail.subject).toMatch(/reset/i);
    const resetToken = lastToken();

    expect((await api().post("/api/v1/auth/reset-password").send({ token: resetToken, password: "short" })).status).toBe(422);
    expect((await api().post("/api/v1/auth/reset-password").send({ token: "f".repeat(64), password: "brand-new-pass-1" })).status).toBe(400);

    const ok = await api().post("/api/v1/auth/reset-password").send({ token: resetToken, password: "brand-new-pass-1" });
    expect(ok.status).toBe(200);
    expect((await login(ADMIN_EMAIL, "brand-new-pass-1")).status).toBe(200);
    expect((await login(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(401);

    // the link cannot be reused
    const reuse = await api().post("/api/v1/auth/reset-password").send({ token: resetToken, password: "another-pass-1" });
    expect(reuse.status).toBe(400);
    expect(reuse.body.message).toMatch(/invalid or has expired/i);

    // restore the seeded password through a fresh reset link
    await api().post("/api/v1/auth/forgot-password").send({ email: ADMIN_EMAIL });
    const restore = await api().post("/api/v1/auth/reset-password").send({ token: lastToken(), password: ADMIN_PASSWORD });
    expect(restore.status).toBe(200);
    expect((await login(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(200);
  });

  it("requesting a new link invalidates the previous one, and expired links are refused", async () => {
    await api().post("/api/v1/auth/forgot-password").send({ email: ADMIN_EMAIL });
    const first = lastToken();
    await api().post("/api/v1/auth/forgot-password").send({ email: ADMIN_EMAIL });
    const second = lastToken();
    expect((await api().post("/api/v1/auth/reset-password").send({ token: first, password: "whatever-pass-1" })).status).toBe(400);

    await pool.query(`UPDATE password_reset_tokens SET expires_at = now() - interval '1 minute' WHERE used_at IS NULL`);
    expect((await api().post("/api/v1/auth/reset-password").send({ token: second, password: "whatever-pass-1" })).status).toBe(400);
    expect((await login(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(200);
  });
});
