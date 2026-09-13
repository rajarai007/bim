import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/features/auth/session";
import { SESSION_COOKIE, routes } from "@/lib/constants";

/**
 * Optimistic route guard: verifies the signed session cookie locally and
 * redirects unauthenticated requests to /login (and signed-in users away
 * from it). Every data request is additionally authorised by the API.
 */
const PUBLIC_AUTH_PATHS: string[] = [routes.login, routes.forgotPassword, routes.resetPassword];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/logout") return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_AUTH_PATHS.includes(pathname)) {
    return session ? NextResponse.redirect(new URL(routes.dashboard, request.url)) : NextResponse.next();
  }
  if (!session) {
    const url = new URL(routes.login, request.url);
    const response = NextResponse.redirect(url);
    // Drop an invalid/expired cookie so the login page does not loop.
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|images|icon|favicon.ico).*)"],
};
