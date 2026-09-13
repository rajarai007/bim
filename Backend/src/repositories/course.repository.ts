import { query } from "../config/database";
import type { Course } from "../models";
import type { CourseStatus, SyllabusModule } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `co.id, co.category_id, co.slug, co.title, co.short_description, co.full_description, co.eligibility,
  co.who_should_join, co.outcomes, co.syllabus, co.software, co.careers, co.duration_weeks, co.training_mode,
  co.batch_location, co.image_url, co.image_alt, co.status, co.is_featured, co.meta_title, co.meta_description,
  co.sort_order, co.created_at, co.updated_at,
  ca.slug AS category_slug, ca.name AS category_name, ca.badge AS category_badge`;

const from = `FROM courses co JOIN categories ca ON ca.id = co.category_id`;

export type CourseInput = {
  categoryId: number;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string | null;
  eligibility: string | null;
  whoShouldJoin: string | null;
  outcomes: string[];
  syllabus: SyllabusModule[];
  software: string[];
  careers: string[];
  durationWeeks: number;
  trainingMode: string;
  batchLocation: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  status: CourseStatus;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type CourseListFilters = {
  q?: string;
  categoryId?: number;
  categorySlug?: string;
  status?: CourseStatus;
  featured?: boolean;
  /** Only courses whose category is active (public listings). */
  activeCategory?: boolean;
  page: number;
  pageSize: number;
};

function buildWhere(filters: Omit<CourseListFilters, "page" | "pageSize">, sql: SqlBuilder): string {
  const clauses: string[] = [];
  if (filters.q) clauses.push(`(co.title ILIKE ${sql.add(likePattern(filters.q))} OR co.slug ILIKE ${sql.add(likePattern(filters.q))})`);
  if (filters.categoryId) clauses.push(`co.category_id = ${sql.add(filters.categoryId)}`);
  if (filters.categorySlug) clauses.push(`ca.slug = ${sql.add(filters.categorySlug)}`);
  if (filters.status) clauses.push(`co.status = ${sql.add(filters.status)}`);
  if (filters.featured !== undefined) clauses.push(`co.is_featured = ${sql.add(filters.featured)}`);
  if (filters.activeCategory) clauses.push(`ca.status = 'active'`);
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

export const courseRepository = {
  async list(filters: CourseListFilters): Promise<{ items: Course[]; total: number }> {
    const sql = new SqlBuilder();
    const where = buildWhere(filters, sql);
    const countRes = await query<{ count: number }>(`SELECT count(*)::int AS count ${from} ${where}`, sql.params);
    const limit = sql.add(filters.pageSize);
    const offset = sql.add((filters.page - 1) * filters.pageSize);
    const { rows } = await query(
      `SELECT ${columns} ${from} ${where} ORDER BY co.sort_order, co.id LIMIT ${limit} OFFSET ${offset}`,
      sql.params,
    );
    return { items: toCamelRows<Course>(rows), total: countRes.rows[0]!.count };
  },

  async findAll(filters: Omit<CourseListFilters, "page" | "pageSize"> = {}): Promise<Course[]> {
    const sql = new SqlBuilder();
    const where = buildWhere(filters, sql);
    const { rows } = await query(`SELECT ${columns} ${from} ${where} ORDER BY co.sort_order, co.id`, sql.params);
    return toCamelRows<Course>(rows);
  },

  async findById(id: number): Promise<Course | null> {
    const { rows } = await query(`SELECT ${columns} ${from} WHERE co.id = $1`, [id]);
    return rows[0] ? toCamel<Course>(rows[0]) : null;
  },

  async findBySlug(slug: string, options: { status?: CourseStatus; activeCategory?: boolean } = {}): Promise<Course | null> {
    const sql = new SqlBuilder();
    const clauses = [`co.slug = ${sql.add(slug)}`];
    if (options.status) clauses.push(`co.status = ${sql.add(options.status)}`);
    // Public reads: a course is only reachable while its category is active (matches the list filter).
    if (options.activeCategory) clauses.push(`ca.status = 'active'`);
    const { rows } = await query(`SELECT ${columns} ${from} WHERE ${clauses.join(" AND ")}`, sql.params);
    return rows[0] ? toCamel<Course>(rows[0]) : null;
  },

  /** Other active courses from the same category (for "Related Programs"). */
  async findRelated(course: Course, limit = 3): Promise<Course[]> {
    const { rows } = await query(
      `SELECT ${columns} ${from}
       WHERE co.category_id = $1 AND co.id <> $2 AND co.status = 'active'
       ORDER BY co.is_featured DESC, co.sort_order, co.id LIMIT $3`,
      [course.categoryId, course.id, limit],
    );
    return toCamelRows<Course>(rows);
  },

  async create(input: CourseInput): Promise<Course> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO courses (
         category_id, slug, title, short_description, full_description, eligibility, who_should_join, outcomes,
         syllabus, software, careers, duration_weeks, training_mode, batch_location, image_url, image_alt,
         status, is_featured, meta_title, meta_description, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
         (SELECT coalesce(max(sort_order), 0) + 1 FROM courses))
       RETURNING id`,
      [
        input.categoryId, input.slug, input.title, input.shortDescription, input.fullDescription, input.eligibility,
        input.whoShouldJoin, input.outcomes, JSON.stringify(input.syllabus), input.software, input.careers,
        input.durationWeeks, input.trainingMode, input.batchLocation, input.imageUrl, input.imageAlt, input.status,
        input.isFeatured, input.metaTitle, input.metaDescription,
      ],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: CourseInput): Promise<Course | null> {
    const { rowCount } = await query(
      `UPDATE courses SET
         category_id = $2, slug = $3, title = $4, short_description = $5, full_description = $6, eligibility = $7,
         who_should_join = $8, outcomes = $9, syllabus = $10::jsonb, software = $11, careers = $12, duration_weeks = $13,
         training_mode = $14, batch_location = $15, image_url = $16, image_alt = $17, status = $18, is_featured = $19,
         meta_title = $20, meta_description = $21
       WHERE id = $1`,
      [
        id, input.categoryId, input.slug, input.title, input.shortDescription, input.fullDescription, input.eligibility,
        input.whoShouldJoin, input.outcomes, JSON.stringify(input.syllabus), input.software, input.careers,
        input.durationWeeks, input.trainingMode, input.batchLocation, input.imageUrl, input.imageAlt, input.status,
        input.isFeatured, input.metaTitle, input.metaDescription,
      ],
    );
    return rowCount ? this.findById(id) : null;
  },

  async setFeatured(id: number, isFeatured: boolean): Promise<Course | null> {
    const { rowCount } = await query(`UPDATE courses SET is_featured = $2 WHERE id = $1`, [id, isFeatured]);
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM courses WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },

  async countByStatus(): Promise<{ total: number; active: number; draft: number; inactive: number }> {
    const { rows } = await query<{ total: number; active: number; draft: number; inactive: number }>(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE status = 'active')::int AS active,
              count(*) FILTER (WHERE status = 'draft')::int AS draft,
              count(*) FILTER (WHERE status = 'inactive')::int AS inactive
       FROM courses`,
    );
    return rows[0]!;
  },

  /** Courses created on or before each of the last `days` days (cumulative), oldest first. */
  async cumulativeCounts(days: number): Promise<number[]> {
    const { rows } = await query<{ day: Date; total: number }>(
      `SELECT d::date AS day,
              (SELECT count(*)::int FROM courses WHERE created_at < d + interval '1 day') AS total
       FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') d
       ORDER BY d`,
      [days],
    );
    return rows.map((r) => r.total);
  },

  async countCreatedSince(since: Date): Promise<number> {
    const { rows } = await query<{ count: number }>(`SELECT count(*)::int AS count FROM courses WHERE created_at >= $1`, [since]);
    return rows[0]!.count;
  },
};
