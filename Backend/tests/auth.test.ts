import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { ADMIN_EMAIL, ADMIN_PASSWORD, api } from "./helpers";
import { env } from "../src/config/env";

describe("auth", () => {
  it("rejects invalid credentials", async () => {
    const res = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: "Invalid email or password", errors: [] });
  });

  it("rejects an unknown user with the same message", async () => {
    const res = await api().post("/api/v1/auth/login").send({ email: "nobody@example.com", password: "whatever" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("validates the login body", async () => {
    const res = await api().post("/api/v1/auth/login").send({ email: "not-an-email", password: "" });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toEqual(expect.arrayContaining(["email", "password"]));
  });

  it("signs in with valid credentials and never leaks the password hash", async () => {
    const res = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL.toUpperCase(), password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: ADMIN_EMAIL, role: "super_admin" });
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    expect(JSON.stringify(res.body)).not.toContain("$2a$");

    const payload = jwt.verify(res.body.data.token, env.JWT_SECRET) as jwt.JwtPayload;
    expect(payload.sub).toBeDefined();
    expect(payload.role).toBe("super_admin");
  });

  it("issues a longer-lived token with remember=true", async () => {
    const short = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const long = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, remember: true });
    expect(new Date(long.body.data.expiresAt).getTime()).toBeGreaterThan(new Date(short.body.data.expiresAt).getTime());
  });

  it("returns the current user from /auth/me", async () => {
    const login = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const res = await api().get("/api/v1/auth/me").set("Authorization", `Bearer ${login.body.data.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: ADMIN_EMAIL, name: expect.any(String) });
  });

  it("blocks admin routes without a token", async () => {
    const res = await api().get("/api/v1/admin/dashboard");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false });
  });

  it("blocks admin routes with a tampered or expired token", async () => {
    const forged = jwt.sign({ email: ADMIN_EMAIL, role: "super_admin" }, "not-the-secret", { subject: "1", expiresIn: "1h" });
    expect((await api().get("/api/v1/admin/courses").set("Authorization", `Bearer ${forged}`)).status).toBe(401);

    const expired = jwt.sign({ email: ADMIN_EMAIL, role: "super_admin" }, env.JWT_SECRET, { subject: "1", expiresIn: -10 });
    const res = await api().get("/api/v1/admin/courses").set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("blocks a token whose user no longer exists", async () => {
    const ghost = jwt.sign({ email: "ghost@example.com", role: "admin" }, env.JWT_SECRET, { subject: "999999", expiresIn: "1h" });
    const res = await api().get("/api/v1/admin/courses").set("Authorization", `Bearer ${ghost}`);
    expect(res.status).toBe(401);
  });
});
