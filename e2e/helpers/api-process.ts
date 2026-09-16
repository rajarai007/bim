/**
 * Stops and restarts the backend API process listening on API_URL's port.
 * Only used by the outage tests (E2E_API_CONTROL=1); everything else treats
 * the servers as external.
 */
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { API_URL } from "../playwright.config";

const port = Number(new URL(API_URL).port || 80);
const backendDir = path.resolve(__dirname, "../../Backend");

export function stopApi(): void {
  const pids = execSync(`lsof -t -iTCP:${port} -sTCP:LISTEN || true`).toString().trim().split("\n").filter(Boolean);
  // A hard kill: a graceful SIGTERM keeps serving pooled keep-alive connections while draining.
  for (const pid of pids) process.kill(Number(pid), "SIGKILL");
}

export async function startApi(): Promise<void> {
  const child = spawn("npx", ["tsx", "src/server.ts"], {
    cwd: backendDir,
    env: { ...process.env, PORT: String(port), RATE_LIMIT_ENABLED: "false" },
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("API did not come back up");
}

export async function waitForApiDown(): Promise<void> {
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`${API_URL}/health`);
    } catch {
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("API still answering");
}
