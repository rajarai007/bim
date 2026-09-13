import { env } from "../config/env";
import { closeDatabase, pool } from "../config/database";
import { dropAllTables, runMigrations } from "./migrator";
import { seedDatabase } from "./seeders";

if (env.isProduction) {
  console.error("[reset] refusing to reset a production database");
  process.exit(1);
}

(async () => {
  console.log("[reset] dropping all tables…");
  await dropAllTables(pool);
  await runMigrations(pool, (m) => console.log(`[reset] ${m}`));
  await seedDatabase(pool, (m) => console.log(`[reset] ${m}`));
  console.log("[reset] done");
})()
  .catch((err) => {
    console.error("[reset] failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
