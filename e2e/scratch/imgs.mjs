import { chromium } from "@playwright/test";
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/courses/bim-digital-construction/revit-architecture", { waitUntil: "networkidle" });
console.log(await page.evaluate(() => Array.from(document.images).map(i => ({ src: i.currentSrc.replace(/.*url=/, "").slice(0, 80), loading: i.loading, fetchpriority: i.getAttribute("fetchpriority"), w: i.width, h: i.height, alt: i.alt }))));
await browser.close();
