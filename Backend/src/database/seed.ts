import { closeDatabase, pool } from "../config/database";
import { seedDatabase } from "./seeders";

seedDatabase(pool, (m) => console.log(`[seed] ${m}`))
  .then(() => console.log("[seed] done"))
  .catch((err) => {
    console.error("[seed] failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
