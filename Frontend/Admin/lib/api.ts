import { redirect } from "next/navigation";
import { getSessionToken } from "@/features/auth/server";

export const API_URL = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldError[];
  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
  /** `{ slug: "Must be unique" }` */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const e of this.errors) if (!out[e.field]) out[e.field] = e.message;
    return out;
  }
}

type Envelope<T> = { success: true; data: T; message?: string } | { success: false; message: string; errors?: FieldError[] };

function isNextInternalError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && typeof (err as { digest: unknown }).digest === "string";
}

/** Low-level request without authentication (login). Always fetches fresh data. */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body && !isForm ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    throw new ApiError(503, `Unable to reach the API at ${API_URL}: ${(err as Error).message}`);
  }

  let body: Envelope<T> | undefined;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = undefined;
  }
  if (!res.ok || !body || !body.success) {
    const message = body && !body.success ? body.message : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body && !body.success ? body.errors ?? [] : []);
  }
  return body.data;
}

/**
 * Authenticated request using the admin's session cookie. A 401 from the API
 * means the session is no longer valid → clear it and go back to the login page.
 */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  if (!token) redirect("/logout?reason=expired");
  try {
    return await apiRequest<T>(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/logout?reason=expired");
    throw err;
  }
}

/** Raw authenticated fetch (for non-JSON responses such as CSV exports). */
export async function adminFetchRaw(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getSessionToken();
  if (!token) redirect("/logout?reason=expired");
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    cache: "no-store",
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) redirect("/logout?reason=expired");
  return res;
}
