import { query } from "../config/database";
import type { Media } from "../models";
import { toCamel, toCamelRows } from "./mapper";

const columns = `m.id, m.file_name, m.url, m.mime_type, m.size_bytes, m.uploaded_by, m.created_at`;

/** How many catalogue records point at a media URL. */
const usageSubquery = `(
  (SELECT count(*) FROM courses WHERE image_url = m.url) +
  (SELECT count(*) FROM courses WHERE syllabus_url = m.url) +
  (SELECT count(*) FROM projects WHERE image_url = m.url) +
  (SELECT count(*) FROM trainers WHERE image_url = m.url) +
  (SELECT count(*) FROM testimonials WHERE avatar_url = m.url) +
  (SELECT count(*) FROM site_settings WHERE logo_url = m.url) +
  (SELECT count(*) FROM admin_users WHERE avatar_url = m.url)
)::int AS usage_count`;

export const mediaRepository = {
  async findAll(): Promise<Media[]> {
    const { rows } = await query(`SELECT ${columns}, ${usageSubquery} FROM media m ORDER BY m.created_at DESC, m.id DESC`);
    return toCamelRows<Media>(rows);
  },

  async findById(id: number): Promise<Media | null> {
    const { rows } = await query(`SELECT ${columns}, ${usageSubquery} FROM media m WHERE m.id = $1`, [id]);
    return rows[0] ? toCamel<Media>(rows[0]) : null;
  },

  async create(input: { fileName: string; url: string; mimeType: string; sizeBytes: number; uploadedBy: number | null }): Promise<Media> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO media (file_name, url, mime_type, size_bytes, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [input.fileName, input.url, input.mimeType, input.sizeBytes, input.uploadedBy],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM media WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },
};
