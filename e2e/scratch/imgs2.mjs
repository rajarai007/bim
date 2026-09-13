import { chromium } from "@playwright/test";
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/courses/bim-digital-construction/revit-architecture", { waitUntil: "networkidle" });
console.log(await page.evaluate(() => Array.from(document.images).slice(0,2).map(i => ({ srcAttr: i.getAttribute("src"), loading: i.loading }))));
await browser.close();
