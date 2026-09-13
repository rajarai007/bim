import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { checkDatabaseConnection } from "./config/database";
import { apiRateLimit } from "./middleware/rate-limit";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { serveStoredUploads } from "./middleware/serve-uploads";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, cb) => {
        // Same-origin / server-to-server requests have no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));
  if (!env.isTest) app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  // Static media: seeded catalogue images + admin uploads.
  const staticOptions = { maxAge: "7d", immutable: false, fallthrough: true } as const;
  app.use("/images", express.static(path.join(env.assetsDir, "images"), staticOptions));
  app.use("/uploads", serveStoredUploads, express.static(env.uploadDir, staticOptions));

  app.get("/health", async (_req, res) => {
    try {
      await checkDatabaseConnection();
      res.json({ success: true, data: { status: "ok", database: "connected", uptime: process.uptime() } });
    } catch (err) {
      logger.error({ err }, "Health check failed");
      res.status(503).json({ success: false, message: "Database unavailable", errors: [] });
    }
  });

  app.use("/api/v1", apiRateLimit, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
