import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const logs = [];
page.on("console", m => { if (["error","warning"].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text().slice(0,200)}`); });
page.on("pageerror", e => logs.push(`[pageerror] ${e.message.slice(0,200)}`));
page.on("requestfailed", r => logs.push(`[reqfail] ${r.method()} ${r.url()} ${r.failure()?.errorText}`));
page.on("response", r => { if (r.status() >= 400) logs.push(`[${r.status()}] ${r.request().method()} ${r.url()}`); });
const pages = ["/", "/about", "/courses", "/courses/bim-digital-construction", "/courses/bim-digital-construction/revit-architecture", "/trainers", "/projects", "/faq", "/contact", "/privacy-policy", "/does-not-exist", "/courses/nope", "/courses/bim-digital-construction/nope", "/courses/mep-design/revit-architecture"];
for (const p of pages) {
  logs.length = 0;
  const res = await page.goto(`http://localhost:3000${p}`, { waitUntil: "networkidle" });
  const title = await page.title();
  const h1 = await page.locator("h1").allTextContents();
  const imgs = await page.locator("img").count();
  const brokenImgs = await page.evaluate(() => Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src));
  console.log(`\n=== ${p} → ${res?.status()} | title="${title}" | h1=${JSON.stringify(h1.map(t=>t.trim().slice(0,60)))} | imgs=${imgs} broken=${JSON.stringify(brokenImgs)}`);
  for (const l of logs) console.log("   ", l);
}
await browser.close();
