import { query } from "../config/database";
import type { SitePage } from "../models";
import { toCamel, toCamelRows } from "./mapper";

const columns = `id, path, title, section_count, meta_title, meta_description, sort_order, updated_at`;

export const pageRepository = {
  async findAll(): Promise<SitePage[]> {
    const { rows } = await query(`SELECT ${columns} FROM site_pages ORDER BY sort_order, id`);
    return toCamelRows<SitePage>(rows);
  },

  async findById(id: number): Promise<SitePage | null> {
    const { rows } = await query(`SELECT ${columns} FROM site_pages WHERE id = $1`, [id]);
    return rows[0] ? toCamel<SitePage>(rows[0]) : null;
  },

  async findByPath(path: string): Promise<SitePage | null> {
    const { rows } = await query(`SELECT ${columns} FROM site_pages WHERE path = $1`, [path]);
    return rows[0] ? toCamel<SitePage>(rows[0]) : null;
  },

  async updateMeta(id: number, meta: { metaTitle: string | null; metaDescription: string | null }): Promise<SitePage | null> {
    const { rowCount } = await query(`UPDATE site_pages SET meta_title = $2, meta_description = $3 WHERE id = $1`, [
      id,
      meta.metaTitle,
      meta.metaDescription,
    ]);
    return rowCount ? this.findById(id) : null;
  },
};
