import type { JwtPayload } from "jsonwebtoken";

export type AdminRole = "super_admin" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl: string | null;
};

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string | null;
};

export type CourseStatus = "active" | "draft" | "inactive";
export type CategoryStatus = "active" | "inactive";
export type TrainerStatus = "active" | "inactive";
export type TestimonialStatus = "published" | "pending";
export type ProjectStatus = "published" | "draft";
export type FaqStatus = "published" | "draft";
export type EnquiryStatus = "new" | "contacted" | "follow-up" | "converted" | "lost";
export type EnquirySource = "contact_form" | "course_page";

export type SyllabusModule = { title: string; description: string };

declare global {
  // Express augments `Request` through this namespace; the rule does not apply here.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** Unix-seconds expiry of the presented access token. */
      tokenExp?: number;
      requestId?: string;
    }
  }
}
