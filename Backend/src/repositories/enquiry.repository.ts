import type { PoolClient } from "pg";
import { query } from "../config/database";
import type { Enquiry, EnquiryNote } from "../models";
import type { EnquirySource, EnquiryStatus } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `e.id, e.full_name, e.mobile, e.email, e.course_id, e.course_name, e.qualification, e.experience_level,
  e.message, e.consent, e.source, e.status, e.created_at, e.updated_at,
  (SELECT json_build_object(
      'id', n.id, 'enquiryId', n.enquiry_id, 'adminUserId', n.admin_user_id, 'note', n.note,
      'createdAt', n.created_at, 'adminName', u.name)
     FROM enquiry_notes n LEFT JOIN admin_users u ON u.id = n.admin_user_id
     WHERE n.enquiry_id = e.id ORDER BY n.created_at DESC, n.id DESC LIMIT 1) AS latest_note`;

export type EnquiryInput = {
  fullName: string;
  mobile: string;
  email: string | null;
  courseId: number | null;
  courseName: string | null;
  qualification: string | null;
  experienceLevel: string | null;
  message: string | null;
  consent: boolean;
  source: EnquirySource;
};

export type EnquiryListFilters = {
  q?: string;
  status?: EnquiryStatus;
  /** Matches course_name (case-insensitive substring) */
  course?: string;
  courseId?: number;
  /** Only enquiries received within the last N days */
  days?: number;
  page: number;
  pageSize: number;
};

function mapRow(row: Record<string, unknown>): Enquiry {
  const e = toCamel<Enquiry>(row);
  // json_build_object serialises timestamps as strings; restore the Date.
  if (e.latestNote) e.latestNote = { ...e.latestNote, createdAt: new Date(e.latestNote.createdAt as unknown as string) };
  return e;
}

function buildWhere(filters: Omit<EnquiryListFilters, "page" | "pageSize">, sql: SqlBuilder): string {
  const clauses: string[] = [];
  if (filters.q) {
    const p = sql.add(likePattern(filters.q));
    clauses.push(`(e.full_name ILIKE ${p} OR e.email ILIKE ${p} OR e.mobile ILIKE ${p})`);
  }
  if (filters.status) clauses.push(`e.status = ${sql.add(filters.status)}`);
  if (filters.course) clauses.push(`e.course_name ILIKE ${sql.add(likePattern(filters.course))}`);
  if (filters.courseId) clauses.push(`e.course_id = ${sql.add(filters.courseId)}`);
  if (filters.days) clauses.push(`e.created_at >= now() - (${sql.add(filters.days)}::int * interval '1 day')`);
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

export const enquiryRepository = {
  async list(filters: EnquiryListFilters): Promise<{ items: Enquiry[]; total: number }> {
    const sql = new SqlBuilder();
    const where = buildWhere(filters, sql);
    const countRes = await query<{ count: number }>(`SELECT count(*)::int AS count FROM enquiries e ${where}`, sql.params);
    const limit = sql.add(filters.pageSize);
    const offset = sql.add((filters.page - 1) * filters.pageSize);
    const { rows } = await query(
      `SELECT ${columns} FROM enquiries e ${where} ORDER BY e.created_at DESC, e.id DESC LIMIT ${limit} OFFSET ${offset}`,
      sql.params,
    );
    return { items: rows.map(mapRow), total: countRes.rows[0]!.count };
  },

  async findAll(filters: Omit<EnquiryListFilters, "page" | "pageSize"> = {}): Promise<Enquiry[]> {
    const sql = new SqlBuilder();
    const where = buildWhere(filters, sql);
    const { rows } = await query(`SELECT ${columns} FROM enquiries e ${where} ORDER BY e.created_at DESC, e.id DESC`, sql.params);
    return rows.map(mapRow);
  },

  async findRecent(limit: number): Promise<Enquiry[]> {
    const { rows } = await query(`SELECT ${columns} FROM enquiries e ORDER BY e.created_at DESC, e.id DESC LIMIT $1`, [limit]);
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Enquiry | null> {
    const { rows } = await query(`SELECT ${columns} FROM enquiries e WHERE e.id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(input: EnquiryInput, client?: PoolClient): Promise<Enquiry> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO enquiries (full_name, mobile, email, course_id, course_name, qualification, experience_level, message, consent, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [input.fullName, input.mobile, input.email, input.courseId, input.courseName, input.qualification, input.experienceLevel, input.message, input.consent, input.source],
      client,
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async updateStatus(id: number, status: EnquiryStatus): Promise<Enquiry | null> {
    const { rowCount } = await query(`UPDATE enquiries SET status = $2 WHERE id = $1`, [id, status]);
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM enquiries WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },

  async addNote(enquiryId: number, adminUserId: number | null, note: string): Promise<EnquiryNote> {
    const { rows } = await query(
      `WITH inserted AS (
         INSERT INTO enquiry_notes (enquiry_id, admin_user_id, note) VALUES ($1, $2, $3) RETURNING *
       )
       SELECT i.id, i.enquiry_id, i.admin_user_id, i.note, i.created_at, u.name AS admin_name
       FROM inserted i LEFT JOIN admin_users u ON u.id = i.admin_user_id`,
      [enquiryId, adminUserId, note],
    );
    return toCamel<EnquiryNote>(rows[0]!);
  },

  async findNotes(enquiryId: number): Promise<EnquiryNote[]> {
    const { rows } = await query(
      `SELECT n.id, n.enquiry_id, n.admin_user_id, n.note, n.created_at, u.name AS admin_name
       FROM enquiry_notes n LEFT JOIN admin_users u ON u.id = n.admin_user_id
       WHERE n.enquiry_id = $1 ORDER BY n.created_at DESC, n.id DESC`,
      [enquiryId],
    );
    return toCamelRows<EnquiryNote>(rows);
  },

  async stats(): Promise<{ total: number; new: number; inProgress: number; converted: number; lost: number }> {
    const { rows } = await query<{ total: number; new: number; in_progress: number; converted: number; lost: number }>(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE status = 'new')::int AS new,
              count(*) FILTER (WHERE status IN ('contacted', 'follow-up'))::int AS in_progress,
              count(*) FILTER (WHERE status = 'converted')::int AS converted,
              count(*) FILTER (WHERE status = 'lost')::int AS lost
       FROM enquiries`,
    );
    const r = rows[0]!;
    return { total: r.total, new: r.new, inProgress: r.in_progress, converted: r.converted, lost: r.lost };
  },

  async countBetween(from: Date, to: Date, status?: EnquiryStatus): Promise<number> {
    const params: unknown[] = [from, to];
    let where = `created_at >= $1 AND created_at < $2`;
    if (status) {
      params.push(status);
      where += ` AND status = $3`;
    }
    const { rows } = await query<{ count: number }>(`SELECT count(*)::int AS count FROM enquiries WHERE ${where}`, params);
    return rows[0]!.count;
  },

  /** Daily enquiry counts for the last `days` days (oldest first). */
  async dailyCounts(days: number): Promise<{ day: string; count: number }[]> {
    const { rows } = await query<{ day: string; count: number }>(
      `SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
              (SELECT count(*)::int FROM enquiries e WHERE e.created_at >= d AND e.created_at < d + interval '1 day') AS count
       FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') d
       ORDER BY d`,
      [days],
    );
    return rows;
  },

  /** Enquiries grouped by course category (uncategorised leads are grouped under "Other"). */
  async countByCategory(): Promise<{ categoryId: number | null; name: string; count: number }[]> {
    const { rows } = await query<{ category_id: number | null; name: string; count: number }>(
      `SELECT ca.id AS category_id, coalesce(ca.name, 'Other') AS name, count(*)::int AS count
       FROM enquiries e
       LEFT JOIN courses co ON co.id = e.course_id
       LEFT JOIN categories ca ON ca.id = co.category_id
       GROUP BY ca.id, ca.name, ca.sort_order
       ORDER BY count DESC, ca.sort_order NULLS LAST`,
    );
    return rows.map((r) => ({ categoryId: r.category_id, name: r.name, count: r.count }));
  },
};
