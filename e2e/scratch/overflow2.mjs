import { chromium } from "@playwright/test";
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const p of ["/contact","/","/courses","/faq","/about","/trainers","/projects","/courses/bim-digital-construction/revit-architecture","/privacy-policy"]) {
  await page.goto(`http://localhost:3000${p}`, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: window.innerWidth, bodyOverflowX: getComputedStyle(document.body).overflowX }));
  console.log(p, r.sw <= r.vw ? "OK" : "OVERFLOW", r);
}
// sticky header still sticks + reveal still triggers
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 1200)); await page.waitForTimeout(600);
console.log("header top after scroll:", await page.evaluate(() => document.querySelector("header").getBoundingClientRect().top));
console.log("revealed elements:", await page.evaluate(() => document.querySelectorAll("[data-visible]").length));
await browser.close();
