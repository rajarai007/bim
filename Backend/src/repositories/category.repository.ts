import { query } from "../config/database";
import type { Category } from "../models";
import type { CategoryStatus } from "../types";
import { toCamel, toCamelRows } from "./mapper";

const columns = `c.id, c.slug, c.name, c.badge, c.summary, c.tagline, c.description, c.icon, c.footer_label,
  c.overview_title, c.status, c.sort_order, c.created_at, c.updated_at,
  (SELECT count(*)::int FROM courses co WHERE co.category_id = c.id) AS course_count`;

export type CategoryInput = {
  slug: string;
  name: string;
  badge: string;
  summary: string;
  tagline: string;
  description: string;
  icon: string;
  footerLabel: string;
  overviewTitle: string;
  status: CategoryStatus;
  sortOrder: number;
};

export const categoryRepository = {
  async findAll(options: { status?: CategoryStatus } = {}): Promise<Category[]> {
    const params: unknown[] = [];
    let where = "";
    if (options.status) {
      params.push(options.status);
      where = `WHERE c.status = $1`;
    }
    const { rows } = await query(`SELECT ${columns} FROM categories c ${where} ORDER BY c.sort_order, c.id`, params);
    return toCamelRows<Category>(rows);
  },

  async findById(id: number): Promise<Category | null> {
    const { rows } = await query(`SELECT ${columns} FROM categories c WHERE c.id = $1`, [id]);
    return rows[0] ? toCamel<Category>(rows[0]) : null;
  },

  async findBySlug(slug: string, status?: CategoryStatus): Promise<Category | null> {
    const params: unknown[] = [slug];
    let where = `c.slug = $1`;
    if (status) {
      params.push(status);
      where += ` AND c.status = $2`;
    }
    const { rows } = await query(`SELECT ${columns} FROM categories c WHERE ${where}`, params);
    return rows[0] ? toCamel<Category>(rows[0]) : null;
  },

  async create(input: CategoryInput): Promise<Category> {
    const { rows } = await query(
      `INSERT INTO categories (slug, name, badge, summary, tagline, description, icon, footer_label, overview_title, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [input.slug, input.name, input.badge, input.summary, input.tagline, input.description, input.icon, input.footerLabel, input.overviewTitle, input.status, input.sortOrder],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: CategoryInput): Promise<Category | null> {
    const { rowCount } = await query(
      `UPDATE categories SET slug = $2, name = $3, badge = $4, summary = $5, tagline = $6, description = $7, icon = $8,
         footer_label = $9, overview_title = $10, status = $11, sort_order = $12
       WHERE id = $1`,
      [id, input.slug, input.name, input.badge, input.summary, input.tagline, input.description, input.icon, input.footerLabel, input.overviewTitle, input.status, input.sortOrder],
    );
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM categories WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },

  async countCourses(id: number): Promise<number> {
    const { rows } = await query<{ count: number }>(`SELECT count(*)::int AS count FROM courses WHERE category_id = $1`, [id]);
    return rows[0]!.count;
  },

  async countProjects(id: number): Promise<number> {
    const { rows } = await query<{ count: number }>(`SELECT count(*)::int AS count FROM projects WHERE category_id = $1`, [id]);
    return rows[0]!.count;
  },

  async nextSortOrder(): Promise<number> {
    const { rows } = await query<{ next: number }>(`SELECT coalesce(max(sort_order), 0) + 1 AS next FROM categories`);
    return rows[0]!.next;
  },
};
