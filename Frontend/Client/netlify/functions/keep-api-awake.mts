/**
 * Netlify Scheduled Function: pings the API every 10 minutes so the free Render
 * instance never spins down. Render sleeps after 15 idle minutes and takes ~35 s to
 * wake, and every page on this site fails with "We couldn't load this page" meanwhile.
 *
 * The GitHub Actions cron in .github/workflows/keep-alive.yml is best-effort: it asked
 * for every 10 minutes but actually ran every 2-5 hours, so it could not do this alone.
 *
 * Scheduled functions run only on the published production deploy and have a 30 s
 * limit. A cold start can outlast that, but the request only has to reach Render to
 * start the wake-up. `/health/live` skips the database so the Neon compute can still
 * suspend when nobody is visiting.
 */
const API_URL = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default async function keepApiAwake(): Promise<void> {
  if (!API_URL.startsWith("https://")) {
    console.log(`keep-api-awake: skipped, no public API URL configured (${API_URL || "unset"})`);
    return;
  }
  const started = Date.now();
  try {
    const res = await fetch(`${API_URL}/health/live`, { cache: "no-store", signal: AbortSignal.timeout(25_000) });
    console.log(`keep-api-awake: HTTP ${res.status} in ${Date.now() - started} ms`);
  } catch (err) {
    console.log(`keep-api-awake: no answer after ${Date.now() - started} ms (${(err as Error).message}); the wake-up is still under way`);
  }
}

export const config = { schedule: "*/10 * * * *" };
