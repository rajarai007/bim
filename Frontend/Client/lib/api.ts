/**
 * Server-side HTTP client for the BIM backend. Every page/service fetches
 * fresh data (`no-store`) so admin edits are reflected immediately.
 */
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
}

type Envelope<T> = { success: true; data: T; message?: string } | { success: false; message: string; errors?: FieldError[] };

/** Next.js signals prerender bail-outs by throwing errors with a `digest`; those must propagate untouched. */
function isNextInternalError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && typeof (err as { digest: unknown }).digest === "string";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      cache: "no-store",
      ...init,
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
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
