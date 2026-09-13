/**
 * Thin client for the backend API used by the tests to seed and clean up data
 * and to verify that UI actions really reached the database.
 */
import { API_URL } from "../playwright.config";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@bimcareeracademy.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export type Envelope<T> = { success: true; data: T; message?: string } | { success: false; message: string; errors: { field: string; message: string }[] };

let cachedToken: string | undefined;

export async function adminToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const body = (await res.json()) as Envelope<{ token: string }>;
  if (!body.success) throw new Error(`API login failed: ${res.status} ${body.message}`);
  cachedToken = body.data.token;
  return cachedToken;
}

export async function api<T = unknown>(
  method: string,
  path: string,
  options: { body?: unknown; auth?: boolean; raw?: boolean } = {},
): Promise<{ status: number; body: Envelope<T>; text: string }> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.auth !== false) headers.authorization = `Bearer ${await adminToken()}`;
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let body: Envelope<T>;
  try {
    body = JSON.parse(text) as Envelope<T>;
  } catch {
    body = { success: false, message: text, errors: [] };
  }
  return { status: res.status, body, text };
}

/** Unwraps a successful envelope or throws with the API message. */
export async function apiData<T>(method: string, path: string, options?: { body?: unknown; auth?: boolean }): Promise<T> {
  const res = await api<T>(method, path, options);
  if (!res.body.success) throw new Error(`${method} ${path} → ${res.status}: ${res.body.message}`);
  return res.body.data;
}

/** Unique suffix so parallel/re-run suites never collide on slugs or names. */
export const uniq = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export type ApiCategory = { id: number; slug: string; name: string; badge: string; status: string; courseCount: number };
export type ApiCourse = { id: number; slug: string; title: string; status: string; isFeatured: boolean; categoryId: number; categorySlug: string; durationWeeks: number; updatedAt: string };
export type ApiEnquiry = { id: number; fullName: string; mobile: string; email: string | null; courseName: string | null; status: string; source: string; consent: boolean; message: string | null; experienceLevel: string | null; qualification: string | null; latestNote: { note: string } | null };

export const categories = () => apiData<ApiCategory[]>("GET", "/admin/categories");

export async function findEnquiryByName(fullName: string): Promise<ApiEnquiry | undefined> {
  const list = await apiData<{ items: ApiEnquiry[] }>("GET", `/admin/enquiries?q=${encodeURIComponent(fullName)}&pageSize=50`);
  return list.items.find((e) => e.fullName === fullName);
}

export async function deleteEnquiriesMatching(q: string): Promise<void> {
  const list = await apiData<{ items: ApiEnquiry[] }>("GET", `/admin/enquiries?q=${encodeURIComponent(q)}&pageSize=100`);
  for (const e of list.items) await api("DELETE", `/admin/enquiries/${e.id}`);
}

export async function deleteCourseBySlug(slug: string): Promise<void> {
  const list = await apiData<{ items: ApiCourse[] }>("GET", `/admin/courses?q=${encodeURIComponent(slug)}&pageSize=100`);
  for (const c of list.items.filter((c) => c.slug === slug)) await api("DELETE", `/admin/courses/${c.id}`);
}
