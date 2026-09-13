import { chromium } from "@playwright/test";
const browser = await chromium.launch(); const ctx = await browser.newContext(); const page = await ctx.newPage();
const logs=[]; page.on("console", m => { if (["error","warning"].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text().slice(0,160)}`); });
await page.goto("http://localhost:3001/login"); await page.fill("#email","admin@bimcareeracademy.com"); await page.fill("#password","admin123"); await page.click("button[type=submit]"); await page.waitForURL("http://localhost:3001/");
for (const p of ["/courses/999999/edit","/courses/abc/edit","/does-not-exist","/courses/1/edit","/media","/profile"]) {
  logs.length=0; const res = await page.goto(`http://localhost:3001${p}`, { waitUntil: "networkidle" });
  console.log(p, "→", res.status(), "|", (await page.locator("h1,h2").allTextContents()).map(t=>t.trim()).slice(0,2).join(" / "), "| sidebar:", await page.locator("aside nav").count(), logs.length ? logs : "");
}
await browser.close();
