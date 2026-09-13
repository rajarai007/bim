/**
 * Small helpers for building parameterised SQL without an ORM.
 */
export class SqlBuilder {
  readonly params: unknown[] = [];

  /** Registers a parameter and returns its `$n` placeholder. */
  add(value: unknown): string {
    this.params.push(value);
    return `$${this.params.length}`;
  }
}

/** Escapes `%` and `_` so user input can be used inside an ILIKE pattern. */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}
