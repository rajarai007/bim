import { query } from "../config/database";
import type { Project } from "../models";
import type { ProjectStatus } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `p.id, p.category_id, p.title, p.description, p.software, p.image_url, p.image_alt, p.show_on_home,
  p.status, p.sort_order, p.created_at, p.updated_at,
  ca.slug AS category_slug, ca.name AS category_name, ca.badge AS category_badge`;
const from = `FROM projects p JOIN categories ca ON ca.id = p.category_id`;

export type ProjectInput = {
  categoryId: number;
  title: string;
  description: string;
  software: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  showOnHome: boolean;
  status: ProjectStatus;
};

export const projectRepository = {
  async findAll(filters: { status?: ProjectStatus; showOnHome?: boolean; q?: string; activeCategory?: boolean } = {}): Promise<Project[]> {
    const sql = new SqlBuilder();
    const clauses: string[] = [];
    if (filters.status) clauses.push(`p.status = ${sql.add(filters.status)}`);
    if (filters.showOnHome !== undefined) clauses.push(`p.show_on_home = ${sql.add(filters.showOnHome)}`);
    if (filters.q) clauses.push(`(p.title ILIKE ${sql.add(likePattern(filters.q))} OR ca.name ILIKE ${sql.add(likePattern(filters.q))})`);
    if (filters.activeCategory) clauses.push(`ca.status = 'active'`);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(`SELECT ${columns} ${from} ${where} ORDER BY p.sort_order, p.id`, sql.params);
    return toCamelRows<Project>(rows);
  },

  async findById(id: number): Promise<Project | null> {
    const { rows } = await query(`SELECT ${columns} ${from} WHERE p.id = $1`, [id]);
    return rows[0] ? toCamel<Project>(rows[0]) : null;
  },

  async create(input: ProjectInput): Promise<Project> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO projects (category_id, title, description, software, image_url, image_alt, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT coalesce(max(sort_order), 0) + 1 FROM projects)) RETURNING id`,
      [input.categoryId, input.title, input.description, input.software, input.imageUrl, input.imageAlt, input.showOnHome, input.status],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: ProjectInput): Promise<Project | null> {
    const { rowCount } = await query(
      `UPDATE projects SET category_id = $2, title = $3, description = $4, software = $5, image_url = $6, image_alt = $7,
         show_on_home = $8, status = $9 WHERE id = $1`,
      [id, input.categoryId, input.title, input.description, input.software, input.imageUrl, input.imageAlt, input.showOnHome, input.status],
    );
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM projects WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },
};
