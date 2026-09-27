import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Load `.env` from the backend root regardless of the process cwd.
dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const booleanFromString = z
  .string()
  .optional()
  .transform((v) => v === undefined || v === "" ? undefined : v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  TEST_DATABASE_URL: z.string().optional(),
  DB_SSL: booleanFromString,
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("12h"),
  JWT_REMEMBER_EXPIRES_IN: z.string().default("30d"),

  ADMIN_NAME: z.string().default("Administrator"),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  SEED_DEMO_DATA: booleanFromString,

  UPLOAD_DIR: z.string().default("./uploads"),
  /** `disk` (UPLOAD_DIR) or `db` (upload_files table) — see services/upload-storage.ts. */
  UPLOAD_STORAGE: z.enum(["disk", "db"]).default("disk"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),

  RATE_LIMIT_ENABLED: booleanFromString,

  /** Origin of the admin console — used to build password-reset links. */
  ADMIN_URL: z.string().url().default("http://localhost:3001"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanFromString,
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("BIM Career Academy <no-reply@bimcareeracademy.com>"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const raw = parsed.data;
const isTest = raw.NODE_ENV === "test";

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === "production",
  isTest,
  /** Tests always run against the dedicated test database. */
  databaseUrl: isTest ? raw.TEST_DATABASE_URL ?? deriveTestUrl(raw.DATABASE_URL) : raw.DATABASE_URL,
  dbSsl: raw.DB_SSL ?? true,
  seedDemoData: raw.SEED_DEMO_DATA ?? raw.NODE_ENV !== "production",
  rateLimitEnabled: raw.RATE_LIMIT_ENABLED ?? !isTest,
  corsOrigins: raw.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
  uploadDir: path.resolve(__dirname, "../../", raw.UPLOAD_DIR),
  uploadStorage: raw.UPLOAD_STORAGE,
  assetsDir: path.resolve(__dirname, "../../assets"),
  maxUploadBytes: Math.round(raw.MAX_UPLOAD_MB * 1024 * 1024),
  adminUrl: raw.ADMIN_URL.replace(/\/$/, ""),
  smtpSecure: raw.SMTP_SECURE ?? false,
};

/** `postgres://…/neondb?x=y` → `postgres://…/neondb_test?x=y` */
function deriveTestUrl(url: string): string {
  const u = new URL(url);
  u.pathname = `${u.pathname.replace(/\/$/, "")}_test`;
  return u.toString();
}

export type Env = typeof env;
