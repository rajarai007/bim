/** Converts a snake_case DB row into a camelCase object (shallow). */
export function toCamel<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())] = value;
  }
  return out as T;
}

export function toCamelRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => toCamel<T>(r));
}
