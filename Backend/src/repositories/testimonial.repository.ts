import { query } from "../config/database";
import type { Testimonial } from "../models";
import type { TestimonialStatus } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `id, name, program, quote, rating, avatar_url, status, sort_order, created_at, updated_at`;

export type TestimonialInput = {
  name: string;
  program: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  status: TestimonialStatus;
};

export const testimonialRepository = {
  async findAll(filters: { status?: TestimonialStatus; q?: string } = {}): Promise<Testimonial[]> {
    const sql = new SqlBuilder();
    const clauses: string[] = [];
    if (filters.status) clauses.push(`status = ${sql.add(filters.status)}`);
    if (filters.q) clauses.push(`(name ILIKE ${sql.add(likePattern(filters.q))} OR program ILIKE ${sql.add(likePattern(filters.q))})`);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(`SELECT ${columns} FROM testimonials ${where} ORDER BY sort_order, id`, sql.params);
    return toCamelRows<Testimonial>(rows);
  },

  async findById(id: number): Promise<Testimonial | null> {
    const { rows } = await query(`SELECT ${columns} FROM testimonials WHERE id = $1`, [id]);
    return rows[0] ? toCamel<Testimonial>(rows[0]) : null;
  },

  async create(input: TestimonialInput): Promise<Testimonial> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO testimonials (name, program, quote, rating, avatar_url, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT coalesce(max(sort_order), 0) + 1 FROM testimonials)) RETURNING id`,
      [input.name, input.program, input.quote, input.rating, input.avatarUrl, input.status],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: TestimonialInput): Promise<Testimonial | null> {
    const { rowCount } = await query(
      `UPDATE testimonials SET name = $2, program = $3, quote = $4, rating = $5, avatar_url = $6, status = $7 WHERE id = $1`,
      [id, input.name, input.program, input.quote, input.rating, input.avatarUrl, input.status],
    );
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM testimonials WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },
};
