import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifySessionToken, type SessionUser } from "./session";

/** Current admin from the session cookie (server components / actions). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}
