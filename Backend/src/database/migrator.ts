import fs from "node:fs/promises";
import path from "node:path";
import type { Pool } from "pg";

const MIGRATIONS_DIR = path.resolve(__dirname, "migrations");

export type AppliedMigration = { name: string; appliedAt: Date };

/**
 * Minimal, dependency-free SQL migration runner.
 *  - Migration files live in `src/database/migrations/*.sql` and are applied in
 *    lexical order (prefix them with a zero-padded number).
 *  - Each file runs inside its own transaction and is recorded in
 *    `schema_migrations`, so re-running is a no-op.
 */
export async function runMigrations(pool: Pool, log: (msg: string) => void = () => {}): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT now()
    )
  `);

  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));
  const ran: string[] = [];

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      ran.push(file);
      log(`applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }
  return ran;
}

export async function listAppliedMigrations(pool: Pool): Promise<AppliedMigration[]> {
  const { rows } = await pool.query<{ name: string; applied_at: Date }>(
    "SELECT name, applied_at FROM schema_migrations ORDER BY name",
  );
  return rows.map((r) => ({ name: r.name, appliedAt: r.applied_at }));
}

/** Drops every application table (used by `db:reset` and the test suite). */
export async function dropAllTables(pool: Pool): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS
      upload_files, password_reset_tokens, enquiry_notes, enquiries, faqs, faq_categories, projects, testimonials, trainers,
      courses, categories, media, site_pages, site_settings, admin_users, schema_migrations
    CASCADE;
    DROP FUNCTION IF EXISTS set_updated_at();
  `);
}
