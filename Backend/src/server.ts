import fs from "node:fs";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { checkDatabaseConnection, closeDatabase } from "./config/database";

async function main() {
  fs.mkdirSync(env.uploadDir, { recursive: true });
  await checkDatabaseConnection();
  logger.info("Database connection established");

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
