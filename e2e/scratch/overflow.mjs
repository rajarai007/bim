import { chromium } from "@playwright/test";
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
const wide = await page.evaluate(() => {
  const vw = window.innerWidth; const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.width > vw + 1) out.push({ tag: el.tagName, id: el.id, cls: (el.className?.toString() || "").slice(0, 120), right: Math.round(r.right), width: Math.round(r.width), text: (el.textContent || "").trim().slice(0, 40) });
  }
  return { vw, sw: document.documentElement.scrollWidth, out: out.slice(0, 15) };
});
console.log(JSON.stringify(wide, null, 1));
await browser.close();
