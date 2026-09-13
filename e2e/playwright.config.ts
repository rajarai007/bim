import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite for BIM Career Academy.
 *
 * Runs against locally running servers:
 *   - Backend API  http://localhost:4000  (Backend: `npm run dev`)
 *   - Client site  http://localhost:3000  (Frontend/Client: `npm run dev -- -p 3000`)
 *   - Admin panel  http://localhost:3001  (Frontend/Admin: `npm run dev -- -p 3001`)
 *
 * Override with CLIENT_URL / ADMIN_URL / API_URL. Tests share one database, so
 * they run with a single worker and clean up the records they create.
 */
export const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";
export const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:3001";
export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "client",
      testDir: "./tests/client",
      use: { baseURL: CLIENT_URL },
    },
    {
      name: "admin-setup",
      testDir: "./tests/admin",
      testMatch: /auth\.setup\.ts/,
      use: { baseURL: ADMIN_URL },
    },
    {
      name: "admin",
      testDir: "./tests/admin",
      testIgnore: /auth\.setup\.ts/,
      dependencies: ["admin-setup"],
      use: { baseURL: ADMIN_URL, storageState: ".auth/admin.json" },
    },
  ],
});
