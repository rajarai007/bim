/**
 * Verifies the backend-issued JWT (HS256) stored in the httpOnly session
 * cookie. Runs in the proxy and in server components without a network call,
 * so ADMIN_SESSION_SECRET must equal the backend's JWT_SECRET.
 */
export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  avatarUrl: string | null;
  /** Unix seconds */
  exp: number;
};

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return value;
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

/** Returns the token payload when the signature is valid and it has not expired, otherwise null. */
export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts as [string, string, string];
  try {
    const decodedHeader = JSON.parse(new TextDecoder().decode(base64UrlDecode(header))) as { alg?: string };
    if (decodedHeader.alg !== "HS256") return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      base64UrlDecode(signature) as BufferSource,
      encoder.encode(`${header}.${payload}`),
    );
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as {
      sub?: string;
      email?: string;
      name?: string;
      role?: SessionUser["role"];
      avatarUrl?: string | null;
      exp?: number;
    };
    if (!claims.sub || !claims.exp || claims.exp * 1000 <= Date.now()) return null;
    return {
      id: Number(claims.sub),
      email: claims.email ?? "",
      name: claims.name ?? "Administrator",
      role: claims.role ?? "admin",
      avatarUrl: claims.avatarUrl ?? null,
      exp: claims.exp,
    };
  } catch {
    return null;
  }
}

/** Reads `iat` / `exp` from a token we received from the API (no verification needed server-side). */
export function readTokenLifetime(token: string): { iat: number; exp: number } | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as { iat?: number; exp?: number };
    return claims.iat && claims.exp ? { iat: claims.iat, exp: claims.exp } : null;
  } catch {
    return null;
  }
}
