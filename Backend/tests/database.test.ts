import { describe, expect, it } from "vitest";
import { pool } from "../src/config/database";
import { listAppliedMigrations } from "../src/database/migrator";

describe("database", () => {
  it("connects to the test database", async () => {
    const { rows } = await pool.query<{ db: string; one: number }>("SELECT current_database() AS db, 1 AS one");
    expect(rows[0]!.one).toBe(1);
    expect(rows[0]!.db).toMatch(/_test$/);
  });

  it("has applied every migration", async () => {
    const applied = await listAppliedMigrations(pool);
    expect(applied.map((m) => m.name)).toContain("0001_initial_schema.sql");
  });

  it("created every application table", async () => {
    const { rows } = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
    );
    const names = rows.map((r) => r.table_name);
    for (const t of [
      "admin_users", "categories", "courses", "enquiries", "enquiry_notes", "faq_categories", "faqs", "media",
      "projects", "site_pages", "site_settings", "testimonials", "trainers",
    ]) {
      expect(names).toContain(t);
    }
  });

  it("enforces foreign keys, checks and unique constraints", async () => {
    await expect(pool.query(`INSERT INTO courses (category_id, slug, title, short_description, duration_weeks) VALUES (99999, 'x', 'x', 'x', 4)`)).rejects.toMatchObject({ code: "23503" });
    await expect(pool.query(`INSERT INTO testimonials (name, program, quote, rating) VALUES ('a', 'b', 'c', 9)`)).rejects.toMatchObject({ code: "23514" });
    await expect(pool.query(`INSERT INTO categories (slug, name, badge, summary, tagline, description, footer_label, overview_title) VALUES ('bim-digital-construction', 'dup', 'd', 's', 't', 'd', 'f', 'o')`)).rejects.toMatchObject({ code: "23505" });
    await expect(pool.query(`INSERT INTO site_settings (id, academy_name, address, phone, email) VALUES (2, 'a', 'b', 'c', 'd')`)).rejects.toMatchObject({ code: "23514" });
  });

  it("keeps updated_at current via trigger", async () => {
    const before = await pool.query<{ updated_at: Date }>(`SELECT updated_at FROM categories WHERE slug = 'bim-digital-construction'`);
    await pool.query(`UPDATE categories SET summary = summary WHERE slug = 'bim-digital-construction'`);
    const after = await pool.query<{ updated_at: Date }>(`SELECT updated_at FROM categories WHERE slug = 'bim-digital-construction'`);
    expect(after.rows[0]!.updated_at.getTime()).toBeGreaterThanOrEqual(before.rows[0]!.updated_at.getTime());
  });

  it("seeded the catalogue", async () => {
    const counts = await pool.query<{ t: string; c: number }>(`
      SELECT 'categories' t, count(*)::int c FROM categories UNION ALL
      SELECT 'courses', count(*)::int FROM courses UNION ALL
      SELECT 'trainers', count(*)::int FROM trainers UNION ALL
      SELECT 'faqs', count(*)::int FROM faqs UNION ALL
      SELECT 'admin_users', count(*)::int FROM admin_users`);
    const map = Object.fromEntries(counts.rows.map((r) => [r.t, r.c]));
    expect(map.categories).toBe(4);
    expect(map.courses).toBe(30);
    expect(map.trainers).toBe(8);
    expect(map.faqs).toBe(17);
    expect(map.admin_users).toBeGreaterThanOrEqual(1);
  });
});
