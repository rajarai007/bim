import { afterAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_ENABLED = "false";
process.env.JWT_SECRET ??= "test-secret-test-secret-test-secret";

afterAll(async () => {
  const { closeDatabase } = await import("../src/config/database");
  await closeDatabase();
});
