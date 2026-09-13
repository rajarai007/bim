import { query } from "../config/database";
import type { Trainer } from "../models";
import type { TrainerStatus } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `id, name, role, home_role, specialization, bio, experience_years, tags, image_url, image_alt,
  linkedin_url, show_on_home, status, sort_order, created_at, updated_at`;

export type TrainerInput = {
  name: string;
  role: string;
  homeRole: string | null;
  specialization: string | null;
  bio: string;
  experienceYears: number;
  tags: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  linkedinUrl: string | null;
  showOnHome: boolean;
  status: TrainerStatus;
};

export const trainerRepository = {
  async findAll(filters: { status?: TrainerStatus; showOnHome?: boolean; q?: string } = {}): Promise<Trainer[]> {
    const sql = new SqlBuilder();
    const clauses: string[] = [];
    if (filters.status) clauses.push(`status = ${sql.add(filters.status)}`);
    if (filters.showOnHome !== undefined) clauses.push(`show_on_home = ${sql.add(filters.showOnHome)}`);
    if (filters.q) clauses.push(`(name ILIKE ${sql.add(likePattern(filters.q))} OR role ILIKE ${sql.add(likePattern(filters.q))})`);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(`SELECT ${columns} FROM trainers ${where} ORDER BY sort_order, id`, sql.params);
    return toCamelRows<Trainer>(rows);
  },

  async findById(id: number): Promise<Trainer | null> {
    const { rows } = await query(`SELECT ${columns} FROM trainers WHERE id = $1`, [id]);
    return rows[0] ? toCamel<Trainer>(rows[0]) : null;
  },

  async create(input: TrainerInput): Promise<Trainer> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO trainers (name, role, home_role, specialization, bio, experience_years, tags, image_url, image_alt, linkedin_url, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, (SELECT coalesce(max(sort_order), 0) + 1 FROM trainers))
       RETURNING id`,
      [input.name, input.role, input.homeRole, input.specialization, input.bio, input.experienceYears, input.tags, input.imageUrl, input.imageAlt, input.linkedinUrl, input.showOnHome, input.status],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: TrainerInput): Promise<Trainer | null> {
    const { rowCount } = await query(
      `UPDATE trainers SET name = $2, role = $3, home_role = $4, specialization = $5, bio = $6, experience_years = $7,
         tags = $8, image_url = $9, image_alt = $10, linkedin_url = $11, show_on_home = $12, status = $13
       WHERE id = $1`,
      [id, input.name, input.role, input.homeRole, input.specialization, input.bio, input.experienceYears, input.tags, input.imageUrl, input.imageAlt, input.linkedinUrl, input.showOnHome, input.status],
    );
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM trainers WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },
};
