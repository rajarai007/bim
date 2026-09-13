import { query } from "../config/database";

export type StoredUpload = {
  path: string;
  mimeType: string;
  sizeBytes: number;
  content: Buffer;
  createdAt: Date;
};

/** Raw bytes of admin uploads when `UPLOAD_STORAGE=db`. */
export const uploadFileRepository = {
  /** Inserts the file; returns false if that path already exists (never overwrites). */
  async create(input: { path: string; mimeType: string; sizeBytes: number; content: Buffer }): Promise<boolean> {
    const { rowCount } = await query(
      `INSERT INTO upload_files (path, mime_type, size_bytes, content) VALUES ($1, $2, $3, $4)
       ON CONFLICT (path) DO NOTHING`,
      [input.path, input.mimeType, input.sizeBytes, input.content],
    );
    return Boolean(rowCount);
  },

  async findByPath(path: string): Promise<StoredUpload | null> {
    const { rows } = await query<{ path: string; mime_type: string; size_bytes: number; content: Buffer; created_at: Date }>(
      `SELECT path, mime_type, size_bytes, content, created_at FROM upload_files WHERE path = $1`,
      [path],
    );
    const row = rows[0];
    if (!row) return null;
    return { path: row.path, mimeType: row.mime_type, sizeBytes: row.size_bytes, content: row.content, createdAt: row.created_at };
  },

  async delete(path: string): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM upload_files WHERE path = $1`, [path]);
    return Boolean(rowCount);
  },
};
