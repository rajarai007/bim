import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { Pool, PoolClient } from "pg";
import { env } from "../../config/env";
import * as seed from "./data";

type Log = (msg: string) => void;

/**
 * Idempotent seeder: content rows are inserted only when missing (keyed by
 * slug / natural key) so re-running never overwrites admin edits.
 */
export async function seedDatabase(pool: Pool, log: Log = () => {}): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedAdminUser(client, log);
    await seedMedia(client, log);
    const categoryIds = await seedCategories(client, log);
    const courseIds = await seedCourses(client, categoryIds, log);
    await seedTrainers(client, log);
    await seedTestimonials(client, log);
    await seedProjects(client, categoryIds, log);
    await seedFaqs(client, log);
    await seedSettings(client, log);
    await seedPages(client, log);
    if (env.seedDemoData) await seedDemoEnquiries(client, courseIds, log);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function seedAdminUser(client: PoolClient, log: Log): Promise<number> {
  const email = env.ADMIN_EMAIL ?? (env.isProduction ? undefined : "admin@bimcareeracademy.com");
  const password = env.ADMIN_PASSWORD ?? (env.isProduction ? undefined : "admin123");
  if (!email || !password) {
    // Credentials are only needed to create the very first admin; an already
    // provisioned database (e.g. production redeploys) keeps its existing admins.
    const first = await client.query<{ id: number }>("SELECT id FROM admin_users ORDER BY id LIMIT 1");
    if (first.rows[0]) return first.rows[0].id;
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the initial admin user");
  }
  const existing = await client.query<{ id: number }>("SELECT id FROM admin_users WHERE lower(email) = lower($1)", [email]);
  if (existing.rows[0]) return existing.rows[0].id;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await client.query<{ id: number }>(
    `INSERT INTO admin_users (name, email, password_hash, role, avatar_url) VALUES ($1, $2, $3, 'super_admin', '/images/avatar-admin.png') RETURNING id`,
    [env.ADMIN_NAME, email, hash],
  );
  log(`admin user ${email} created`);
  return rows[0]!.id;
}

async function seedMedia(client: PoolClient, log: Log) {
  const dir = path.join(env.assetsDir, "images");
  const files = (await fs.readdir(dir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  let inserted = 0;
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    const ext = path.extname(file).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    const res = await client.query(
      `INSERT INTO media (file_name, url, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4) ON CONFLICT (url) DO NOTHING`,
      [file, `/images/${file}`, mime, stat.size],
    );
    inserted += res.rowCount ?? 0;
  }
  if (inserted) log(`${inserted} media file(s) registered`);
}

async function seedCategories(client: PoolClient, log: Log): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  let inserted = 0;
  for (const [i, c] of seed.categories.entries()) {
    const res = await client.query<{ id: number }>(
      `INSERT INTO categories (slug, name, badge, summary, tagline, description, icon, footer_label, overview_title, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10)
       ON CONFLICT (slug) DO NOTHING RETURNING id`,
      [c.slug, c.name, c.badge, c.summary, c.tagline, c.description, c.icon, c.footerLabel, c.overviewTitle, i + 1],
    );
    inserted += res.rowCount ?? 0;
  }
  const { rows } = await client.query<{ id: number; slug: string }>("SELECT id, slug FROM categories");
  for (const r of rows) ids.set(r.slug, r.id);
  if (inserted) log(`${inserted} categories inserted`);
  return ids;
}

async function seedCourses(client: PoolClient, categoryIds: Map<string, number>, log: Log): Promise<Map<string, number>> {
  let inserted = 0;
  for (const [i, c] of seed.courses.entries()) {
    const categoryId = categoryIds.get(c.category);
    if (!categoryId) throw new Error(`Seed course ${c.slug} references unknown category ${c.category}`);
    const res = await client.query(
      `INSERT INTO courses (
         category_id, slug, title, short_description, full_description, eligibility, who_should_join,
         outcomes, syllabus, software, careers, duration_weeks, training_mode, batch_location,
         image_url, image_alt, status, is_featured, meta_title, meta_description, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       ON CONFLICT (slug) DO NOTHING`,
      [
        categoryId,
        c.slug,
        c.title,
        c.shortDescription,
        c.fullDescription ?? null,
        c.eligibility ?? "Basic technical drawing knowledge, architectural/construction core interest, and computer operations competence.",
        c.whoShouldJoin ?? "Civil Engineers, Architects, Interior Designers, BIM Drafters, and students pursuing these engineering pathways.",
        c.outcomes ?? [],
        JSON.stringify(c.syllabus ?? []),
        c.software ?? [],
        c.careers ?? [],
        c.durationWeeks,
        c.trainingMode ?? "Offline & Online",
        c.batchLocation ?? "Noida Center",
        c.imageUrl,
        c.imageAlt,
        c.status ?? "active",
        c.featured ?? false,
        c.metaTitle ?? null,
        c.metaDescription ?? null,
        i + 1,
      ],
    );
    inserted += res.rowCount ?? 0;
  }
  const ids = new Map<string, number>();
  const { rows } = await client.query<{ id: number; slug: string }>("SELECT id, slug FROM courses");
  for (const r of rows) ids.set(r.slug, r.id);
  if (inserted) log(`${inserted} courses inserted`);
  return ids;
}

async function seedTrainers(client: PoolClient, log: Log) {
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM trainers");
  if (rows[0]!.count > 0) return;
  for (const [i, t] of seed.trainers.entries()) {
    await client.query(
      `INSERT INTO trainers (name, role, home_role, specialization, bio, experience_years, tags, image_url, image_alt, linkedin_url, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [t.name, t.role, t.homeRole ?? null, t.specialization ?? null, t.bio, t.experienceYears, t.tags, t.imageUrl, t.imageAlt, t.linkedinUrl, t.showOnHome ?? false, t.status ?? "active", i + 1],
    );
  }
  log(`${seed.trainers.length} trainers inserted`);
}

async function seedTestimonials(client: PoolClient, log: Log) {
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM testimonials");
  if (rows[0]!.count > 0) return;
  for (const [i, t] of seed.testimonials.entries()) {
    await client.query(
      `INSERT INTO testimonials (name, program, quote, rating, avatar_url, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [t.name, t.program, t.quote, t.rating, t.avatarUrl, t.status, i + 1],
    );
  }
  log(`${seed.testimonials.length} testimonials inserted`);
}

async function seedProjects(client: PoolClient, categoryIds: Map<string, number>, log: Log) {
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM projects");
  if (rows[0]!.count > 0) return;
  for (const [i, p] of seed.projects.entries()) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Seed project ${p.title} references unknown category ${p.category}`);
    await client.query(
      `INSERT INTO projects (category_id, title, description, software, image_url, image_alt, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [categoryId, p.title, p.description, p.software, p.imageUrl, p.imageAlt, p.showOnHome ?? false, p.status ?? "published", i + 1],
    );
  }
  log(`${seed.projects.length} projects inserted`);
}

async function seedFaqs(client: PoolClient, log: Log) {
  for (const [i, c] of seed.faqCategories.entries()) {
    await client.query(
      `INSERT INTO faq_categories (slug, label, sort_order) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.label, i + 1],
    );
  }
  const cats = await client.query<{ id: number; slug: string }>("SELECT id, slug FROM faq_categories");
  const ids = new Map(cats.rows.map((r) => [r.slug, r.id]));
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM faqs");
  if (rows[0]!.count > 0) return;
  for (const [i, f] of seed.faqs.entries()) {
    await client.query(
      `INSERT INTO faqs (faq_category_id, question, answer, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ids.get(f.category), f.question, f.answer, f.showOnHome ?? false, f.status ?? "published", i + 1],
    );
  }
  log(`${seed.faqs.length} FAQs inserted`);
}

async function seedSettings(client: PoolClient, log: Log) {
  const s = seed.settings;
  const res = await client.query(
    `INSERT INTO site_settings (id, academy_name, address, phone, whatsapp, email, working_hours, instagram_url, facebook_url, linkedin_url, youtube_url)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
    [s.academyName, s.address, s.phone, s.whatsapp, s.email, s.workingHours, s.instagramUrl, s.facebookUrl, s.linkedinUrl, s.youtubeUrl],
  );
  if (res.rowCount) log("site settings inserted");
}

async function seedPages(client: PoolClient, log: Log) {
  let inserted = 0;
  for (const [i, p] of seed.pages.entries()) {
    const res = await client.query(
      `INSERT INTO site_pages (path, title, section_count, meta_title, meta_description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (path) DO NOTHING`,
      [p.path, p.title, p.sectionCount, p.metaTitle, p.metaDescription, i + 1],
    );
    inserted += res.rowCount ?? 0;
  }
  if (inserted) log(`${inserted} site pages inserted`);
}

async function seedDemoEnquiries(client: PoolClient, courseIds: Map<string, number>, log: Log) {
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM enquiries");
  if (rows[0]!.count > 0) return;
  const admin = await client.query<{ id: number }>("SELECT id FROM admin_users ORDER BY id LIMIT 1");
  const titles = await client.query<{ id: number; title: string }>("SELECT id, title FROM courses");
  const titleById = new Map(titles.rows.map((r) => [r.id, r.title]));
  for (const e of seed.demoEnquiries) {
    const courseId = courseIds.get(e.course) ?? null;
    const createdAt = new Date(Date.now() - e.daysAgo * 86_400_000 - Math.floor(Math.random() * 6) * 3_600_000);
    const inserted = await client.query<{ id: number }>(
      `INSERT INTO enquiries (full_name, mobile, email, course_id, course_name, qualification, experience_level, message, consent, source, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9, $10, $11, $11) RETURNING id`,
      [
        e.fullName,
        e.mobile,
        e.email,
        courseId,
        courseId ? titleById.get(courseId) ?? null : null,
        "qualification" in e ? e.qualification : null,
        "Professional",
        "message" in e ? e.message : null,
        e.source,
        e.status,
        createdAt,
      ],
    );
    if ("note" in e && e.note) {
      await client.query(`INSERT INTO enquiry_notes (enquiry_id, admin_user_id, note) VALUES ($1, $2, $3)`, [
        inserted.rows[0]!.id,
        admin.rows[0]?.id ?? null,
        e.note,
      ]);
    }
  }
  log(`${seed.demoEnquiries.length} demo enquiries inserted`);
}
