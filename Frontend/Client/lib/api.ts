/**
 * Server-side HTTP client for the BIM backend. Reads are cached (ISR): pages
 * are prerendered and served from the CDN, then regenerated in the background
 * at most every `CONTENT_REVALIDATE_SECONDS`, so visitors never wait on the API.
 * Admin edits expire the cache right away through `/api/revalidate`.
 */
export const API_URL = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Keep in sync with `revalidate` in app/layout.tsx (route config must be a literal). */
export const CONTENT_REVALIDATE_SECONDS = 60;
/** Cache tag on every API read; `/api/revalidate` expires it after admin edits. */
export const CONTENT_CACHE_TAG = "api";

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldError[];
  /** The API app never answered: network failure, gateway error or a non-API response. */
  readonly transient: boolean;
  constructor(status: number, message: string, errors: FieldError[] = [], transient = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.transient = transient;
  }
}

/**
 * The API runs on a free Render instance that sleeps after 15 idle minutes and takes
 * ~35 s to wake, and requests fail while it wakes. Reads are retried for up to this long
 * so a visitor gets a slow page instead of the error page. Netlify stops server
 * functions at 60 s, so this leaves room to render.
 */
const WAKE_RETRY_BUDGET_MS = 40_000;
const GATEWAY_STATUSES = new Set([502, 503, 504]);

type Envelope<T> = { success: true; data: T; message?: string } | { success: false; message: string; errors?: FieldError[] };

/** Next.js signals prerender bail-outs by throwing errors with a `digest`; those must propagate untouched. */
function isNextInternalError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && typeof (err as { digest: unknown }).digest === "string";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return request<T>(path, init);

  const deadline = Date.now() + WAKE_RETRY_BUDGET_MS;
  for (let attempt = 1; ; attempt++) {
    try {
      return await request<T>(path, { ...init, signal: init.signal ?? AbortSignal.timeout(Math.max(deadline - Date.now(), 1_000)) });
    } catch (err) {
      const delay = Math.min(1_000 * 2 ** (attempt - 1), 5_000);
      if (!(err instanceof ApiError && err.transient) || Date.now() + delay >= deadline) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const caching: RequestInit =
    method === "GET" || method === "HEAD"
      ? { next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] } }
      : { cache: "no-store" };
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      ...caching,
      ...init,
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    throw new ApiError(503, `Unable to reach the API at ${API_URL}: ${(err as Error).message}`, [], true);
  }

  let body: Envelope<T> | undefined;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = undefined;
  }

  if (!res.ok || !body || !body.success) {
    const message = body && !body.success ? body.message : `Request failed with status ${res.status}`;
    // No JSON envelope or a gateway status means something other than the API answered.
    const transient = typeof body?.success !== "boolean" || GATEWAY_STATUSES.has(res.status);
    throw new ApiError(res.status, message, body && !body.success ? body.errors ?? [] : [], transient);
  }
  return body.data;
}
