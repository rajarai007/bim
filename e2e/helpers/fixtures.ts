/**
 * Test fixtures shared by the client and admin suites.
 *
 * `audit` records console errors/warnings, uncaught page errors, failed
 * requests and 4xx/5xx responses for the page under test. Every test asserts
 * a clean audit at the end unless it explicitly expects a status (e.g. a 404
 * page) through `audit.allow(...)`.
 */
import { test as base, expect, type ConsoleMessage, type Page, type Request, type Response } from "@playwright/test";

export type AuditEntry = { kind: "console" | "pageerror" | "requestfailed" | "response"; detail: string };

export class Audit {
  readonly entries: AuditEntry[] = [];
  private readonly allowed: RegExp[] = [];

  constructor(page: Page) {
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        this.entries.push({ kind: "console", detail: `[${msg.type()}] ${msg.text()}` });
      }
    });
    page.on("pageerror", (err) => this.entries.push({ kind: "pageerror", detail: `${err.name}: ${err.message}` }));
    page.on("requestfailed", (req: Request) => {
      this.entries.push({ kind: "requestfailed", detail: `${req.method()} ${req.url()} → ${req.failure()?.errorText}` });
    });
    page.on("response", (res: Response) => {
      if (res.status() >= 400) this.entries.push({ kind: "response", detail: `${res.request().method()} ${res.url()} → ${res.status()}` });
    });
  }

  /** Whitelists entries matching the pattern (e.g. an expected 404 response). */
  allow(pattern: RegExp): void {
    this.allowed.push(pattern);
  }

  /** Entries that are neither whitelisted nor known dev-server noise. */
  get problems(): AuditEntry[] {
    return this.entries.filter((e) => !this.allowed.some((p) => p.test(e.detail)) && !BENIGN.some((p) => p.test(e.detail)));
  }
}

/** Noise produced by the Next.js dev server / browser itself, never by application code. */
const BENIGN: RegExp[] = [
  // Aborted navigations while the test itself moves on (client-side router prefetches, HMR pings).
  /→ net::ERR_ABORTED/,
  /\/_next\/webpack-hmr/,
  /\/__nextjs_original-stack-frames/,
  // React DevTools promotional message is logged at "info" level, listed here defensively.
  /Download the React DevTools/,
];

type Fixtures = { audit: Audit };

export const test = base.extend<Fixtures>({
  audit: async ({ page }, use) => {
    const audit = new Audit(page);
    await use(audit);
    const problems = audit.problems;
    expect(problems, `Browser/network audit found problems:\n${problems.map((p) => `  - ${p.kind}: ${p.detail}`).join("\n")}`).toEqual([]);
  },
});

export { expect };
