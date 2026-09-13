import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAdmin } from "../middleware/auth";
import { loginRateLimit, passwordResetRateLimit } from "../middleware/rate-limit";
import { validate } from "../middleware/validate";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export const authRoutes = Router();

authRoutes.post("/login", loginRateLimit, validate({ body: loginSchema }), authController.login);
authRoutes.post("/forgot-password", passwordResetRateLimit, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
authRoutes.post("/reset-password", passwordResetRateLimit, validate({ body: resetPasswordSchema }), authController.resetPassword);

authRoutes.get("/me", requireAdmin, authController.me);
authRoutes.patch("/me", requireAdmin, validate({ body: profileSchema }), authController.updateProfile);
authRoutes.patch("/password", requireAdmin, validate({ body: changePasswordSchema }), authController.changePassword);
