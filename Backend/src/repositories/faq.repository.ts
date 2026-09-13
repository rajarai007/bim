import { query } from "../config/database";
import type { Faq, FaqCategory } from "../models";
import type { FaqStatus } from "../types";
import { likePattern, SqlBuilder } from "../utils/sql";
import { toCamel, toCamelRows } from "./mapper";

const columns = `f.id, f.faq_category_id, f.question, f.answer, f.show_on_home, f.status, f.sort_order, f.created_at,
  f.updated_at, c.slug AS category_slug, c.label AS category_label`;
const from = `FROM faqs f JOIN faq_categories c ON c.id = f.faq_category_id`;

export type FaqInput = {
  faqCategoryId: number;
  question: string;
  answer: string;
  showOnHome: boolean;
  status: FaqStatus;
};

export const faqRepository = {
  async findCategories(): Promise<FaqCategory[]> {
    const { rows } = await query(`SELECT id, slug, label, sort_order FROM faq_categories ORDER BY sort_order, id`);
    return toCamelRows<FaqCategory>(rows);
  },

  async findCategoryById(id: number): Promise<FaqCategory | null> {
    const { rows } = await query(`SELECT id, slug, label, sort_order FROM faq_categories WHERE id = $1`, [id]);
    return rows[0] ? toCamel<FaqCategory>(rows[0]) : null;
  },

  async findAll(filters: { status?: FaqStatus; showOnHome?: boolean; q?: string } = {}): Promise<Faq[]> {
    const sql = new SqlBuilder();
    const clauses: string[] = [];
    if (filters.status) clauses.push(`f.status = ${sql.add(filters.status)}`);
    if (filters.showOnHome !== undefined) clauses.push(`f.show_on_home = ${sql.add(filters.showOnHome)}`);
    if (filters.q) clauses.push(`(f.question ILIKE ${sql.add(likePattern(filters.q))} OR c.label ILIKE ${sql.add(likePattern(filters.q))})`);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(`SELECT ${columns} ${from} ${where} ORDER BY f.sort_order, f.id`, sql.params);
    return toCamelRows<Faq>(rows);
  },

  async findById(id: number): Promise<Faq | null> {
    const { rows } = await query(`SELECT ${columns} ${from} WHERE f.id = $1`, [id]);
    return rows[0] ? toCamel<Faq>(rows[0]) : null;
  },

  async create(input: FaqInput): Promise<Faq> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO faqs (faq_category_id, question, answer, show_on_home, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, (SELECT coalesce(max(sort_order), 0) + 1 FROM faqs)) RETURNING id`,
      [input.faqCategoryId, input.question, input.answer, input.showOnHome, input.status],
    );
    return (await this.findById(rows[0]!.id))!;
  },

  async update(id: number, input: FaqInput): Promise<Faq | null> {
    const { rowCount } = await query(
      `UPDATE faqs SET faq_category_id = $2, question = $3, answer = $4, show_on_home = $5, status = $6 WHERE id = $1`,
      [id, input.faqCategoryId, input.question, input.answer, input.showOnHome, input.status],
    );
    return rowCount ? this.findById(id) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await query(`DELETE FROM faqs WHERE id = $1`, [id]);
    return Boolean(rowCount);
  },
};
