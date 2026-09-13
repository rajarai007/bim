import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import type { LoginInput, ProfileInput } from "../validators/auth.validator";

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    sendSuccess(res, result, "Signed in successfully");
  },

  async me(req: Request, res: Response) {
    sendSuccess(res, await authService.me(req.user!.id));
  },

  async updateProfile(req: Request, res: Response) {
    const result = await authService.updateProfile(req.user!.id, req.tokenExp!, req.body as ProfileInput);
    sendSuccess(res, result, "Profile updated");
  },

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, null, "Password changed");
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.requestPasswordReset((req.body as { email: string }).email);
    sendSuccess(res, null, "If an account with that email exists, a password reset link has been sent");
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body as { token: string; password: string };
    await authService.resetPassword(token, password);
    sendSuccess(res, null, "Password has been reset. You can now sign in");
  },
};
