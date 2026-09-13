"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, routes } from "@/lib/constants";
import { adminFetch, ApiError, apiRequest } from "@/lib/api";
import { readTokenLifetime } from "@/features/auth/session";
import type { ActionState } from "@/types";

export type LoginState = { error?: string; email?: string } | undefined;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

type LoginResponse = {
  token: string;
  expiresAt: string;
  user: { id: number; email: string; name: string; role: string };
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  let result: LoginResponse;
  try {
    result = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return { email, error: err.status === 503 ? "Unable to reach the API. Please try again shortly." : err.message };
    }
    return { email, error: "Something went wrong. Please try again." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Session cookie unless "Remember me" was ticked; the JWT itself expires either way.
    ...(remember ? { expires: new Date(result.expiresAt) } : {}),
  });
  redirect(routes.dashboard);
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect(routes.login);
}

type ProfileResponse = LoginResponse;

/** Updates the signed-in admin's profile and refreshes the session cookie with the re-issued token. */
export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let result: ProfileResponse;
  try {
    result = await adminFetch<ProfileResponse>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: text(formData, "name"),
        email: text(formData, "email").toLowerCase(),
        avatarUrl: text(formData, "avatarUrl") || null,
      }),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message, fieldErrors: err.fieldErrors };
    throw err;
  }
  // "Remember me" logins get a long-lived token; keep the cookie persistent in that case only.
  const lifetime = readTokenLifetime(result.token);
  const remembered = lifetime ? lifetime.exp - lifetime.iat > 24 * 60 * 60 : false;
  const store = await cookies();
  store.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remembered ? { expires: new Date(result.expiresAt) } : {}),
  });
  revalidatePath(routes.profile);
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const newPassword = text(formData, "newPassword");
  if (newPassword !== text(formData, "confirmPassword")) {
    return { error: "Please correct the highlighted fields.", fieldErrors: { confirmPassword: "Passwords do not match" } };
  }
  try {
    await adminFetch("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: text(formData, "currentPassword"), newPassword }),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message, fieldErrors: err.fieldErrors };
    throw err;
  }
  return { ok: true, message: "Password changed." };
}

export type ForgotPasswordState = { ok?: boolean; error?: string; email?: string } | undefined;

/** Public: asks the API to email a reset link. The response never reveals whether the account exists. */
export async function requestPasswordReset(_prev: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const email = text(formData, "email").toLowerCase();
  try {
    await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    return { ok: true, email };
  } catch (err) {
    if (err instanceof ApiError) {
      return { email, error: err.status === 503 ? "Unable to reach the API. Please try again shortly." : err.errors[0]?.message ?? err.message };
    }
    return { email, error: "Something went wrong. Please try again." };
  }
}

export type ResetPasswordState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | undefined;

/** Public: sets a new password using the token from the emailed link. */
export async function resetPassword(token: string, _prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const password = text(formData, "password");
  if (password !== text(formData, "confirmPassword")) {
    return { error: "Please correct the highlighted fields.", fieldErrors: { confirmPassword: "Passwords do not match" } };
  }
  try {
    await apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      const fieldErrors: Record<string, string> = {};
      if (err.fieldErrors.password) fieldErrors.password = err.fieldErrors.password;
      return { error: err.status === 503 ? "Unable to reach the API. Please try again shortly." : err.message, fieldErrors };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
