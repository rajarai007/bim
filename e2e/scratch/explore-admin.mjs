import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const logs = [];
page.on("console", m => { if (["error","warning"].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text().slice(0,220)}`); });
page.on("pageerror", e => logs.push(`[pageerror] ${e.message.slice(0,200)}`));
page.on("requestfailed", r => logs.push(`[reqfail] ${r.method()} ${r.url()} ${r.failure()?.errorText}`));
page.on("response", r => { if (r.status() >= 400) logs.push(`[${r.status()}] ${r.request().method()} ${r.url()}`); });
const A = "http://localhost:3001";
// unauthenticated redirects
for (const p of ["/", "/courses", "/enquiries", "/settings", "/profile", "/enquiries/export", "/does-not-exist"]) {
  logs.length = 0;
  const res = await page.goto(`${A}${p}`, { waitUntil: "networkidle" });
  console.log(`UNAUTH ${p} → ${res?.status()} final=${page.url().replace(A,"")} h1=${JSON.stringify((await page.locator("h1").allTextContents()).map(t=>t.trim()))}`);
  for (const l of logs) console.log("   ", l);
}
// login
logs.length = 0;
await page.goto(`${A}/login`, { waitUntil: "networkidle" });
await page.fill("#email", "admin@bimcareeracademy.com");
await page.fill("#password", "admin123");
await page.click("button[type=submit]");
await page.waitForURL(`${A}/`, { timeout: 30000 });
await page.waitForLoadState("networkidle");
console.log("LOGIN → ", page.url(), "h1=", await page.locator("h1").allTextContents());
for (const l of logs) console.log("   ", l);
const pages = ["/", "/courses", "/courses/new", "/courses/1/edit", "/courses/999999/edit", "/courses/abc/edit", "/categories", "/enquiries", "/trainers", "/testimonials", "/projects", "/faqs", "/content", "/media", "/seo", "/settings", "/profile", "/login", "/forgot-password", "/reset-password", "/reset-password?token=abc", "/does-not-exist"];
for (const p of pages) {
  logs.length = 0;
  const res = await page.goto(`${A}${p}`, { waitUntil: "networkidle" });
  const title = await page.title();
  const h1 = (await page.locator("h1, h2").allTextContents()).map(t=>t.trim().slice(0,50)).slice(0,3);
  const broken = await page.evaluate(() => Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => (i.currentSrc || i.src).slice(0,120)));
  console.log(`\n=== ${p} → ${res?.status()} final=${page.url().replace(A,"")} | title="${title}" | h=${JSON.stringify(h1)} | broken=${JSON.stringify(broken)}`);
  for (const l of logs) console.log("   ", l);
}
await browser.close();
