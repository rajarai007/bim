/**
 * Runs once before the whole suite: makes sure the dedicated test database
 * exists, then rebuilds its schema from the migrations and seeds it.
 */
import path from "node:path";
import dotenv from "dotenv";
import { Client, Pool } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });
process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_ENABLED = "false";
process.env.SEED_DEMO_DATA = "true";
process.env.JWT_SECRET ??= "test-secret-test-secret-test-secret";

function stripSsl(url: string) {
  const u = new URL(url);
  u.searchParams.delete("sslmode");
  u.searchParams.delete("channel_binding");
  return u.toString();
}

export default async function globalSetup() {
  const base = process.env.DATABASE_URL;
  if (!base) throw new Error("DATABASE_URL must be set to run the test suite");
  const testUrl = process.env.TEST_DATABASE_URL ?? (() => {
    const u = new URL(base);
    u.pathname = `${u.pathname}_test`;
    return u.toString();
  })();
  process.env.TEST_DATABASE_URL = testUrl;
  const ssl = process.env.DB_SSL === "false" ? false : { rejectUnauthorized: true };

  const dbName = new URL(testUrl).pathname.slice(1);
  const admin = new Client({ connectionString: stripSsl(base), ssl });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (!exists.rowCount) await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
  await admin.end();

  const { runMigrations, dropAllTables } = await import("../src/database/migrator");
  const { seedDatabase } = await import("../src/database/seeders");
  const pool = new Pool({ connectionString: stripSsl(testUrl), ssl, max: 2 });
  await dropAllTables(pool);
  await runMigrations(pool);
  await seedDatabase(pool);
  await pool.end();
}
