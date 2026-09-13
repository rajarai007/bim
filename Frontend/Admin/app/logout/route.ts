import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, routes } from "@/lib/constants";

/** Clears the session cookie (used when the API reports the session is no longer valid). */
export function GET(request: NextRequest) {
  const url = new URL(routes.login, request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason) url.searchParams.set("reason", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
