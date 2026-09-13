import request from "supertest";
import { createApp } from "../src/app";
import { env } from "../src/config/env";

export const app = createApp();
export const api = () => request(app);

export const ADMIN_EMAIL = env.ADMIN_EMAIL ?? "admin@bimcareeracademy.com";
export const ADMIN_PASSWORD = env.ADMIN_PASSWORD ?? "admin123";

let cachedToken: string | undefined;

/** Signs in once per test file and returns a Bearer token. */
export async function adminToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await api().post("/api/v1/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (res.status !== 200) throw new Error(`Login failed in test helper: ${res.status} ${JSON.stringify(res.body)}`);
  cachedToken = res.body.data.token as string;
  return cachedToken;
}

export async function authed() {
  const token = await adminToken();
  return { auth: { Authorization: `Bearer ${token}` } };
}
