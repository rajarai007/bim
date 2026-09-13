import { Pool, types } from "pg";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { env } from "./env";
import { logger } from "./logger";

// Keep BIGINT/NUMERIC counts as JS numbers – every count in this app fits.
types.setTypeParser(types.builtins.INT8, (v) => Number(v));
types.setTypeParser(types.builtins.NUMERIC, (v) => Number(v));

/**
 * `pg` warns about `sslmode=require` semantics changing; strip the SSL params
 * from the URL and configure TLS explicitly instead.
 */
export function buildPoolConfig(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const useSsl = env.dbSsl && sslMode !== "disable";
  return {
    connectionString: url.toString(),
    ssl: useSsl ? { rejectUnauthorized: true } : false,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  };
}

export const pool = new Pool(buildPoolConfig(env.databaseUrl));

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle PostgreSQL client");
});

export type Queryable = Pick<Pool | PoolClient, "query">;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  client: Queryable = pool,
): Promise<QueryResult<T>> {
  return client.query<T>(text, params);
}

/** Runs `fn` inside a transaction, rolling back on any thrown error. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function checkDatabaseConnection(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
