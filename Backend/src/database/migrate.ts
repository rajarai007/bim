import { closeDatabase, pool } from "../config/database";
import { runMigrations } from "./migrator";

runMigrations(pool, (m) => console.log(`[migrate] ${m}`))
  .then((ran) => {
    console.log(ran.length ? `[migrate] ${ran.length} migration(s) applied` : "[migrate] database is up to date");
  })
  .catch((err) => {
    console.error("[migrate] failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
