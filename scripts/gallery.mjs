// Devpost gallery images (1500x1000) from the README screenshots, in the app's tokens and font.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "docs/gallery";
const shot = (n) => `data:image/png;base64,${readFileSync(`docs/screenshots/${n}.png`).toString("base64")}`;
const FONT = `<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">`;
const CSS = `
  :root{--paper:#FAFBFC;--ink:#18263A;--soft:#4A5A70;--yellow:#FFD23F;--red:#E5484D;--blue:#3E7BFA;--green:#2FA36B}
  *{box-sizing:border-box;margin:0}
  html,body{width:1500px;height:1000px;background:var(--paper);color:var(--ink);font-family:'Atkinson Hyperlegible',system-ui,sans-serif;overflow:hidden}
  .phone{width:390px;height:844px;border:12px solid var(--ink);border-radius:56px;overflow:hidden;background:#fff;box-shadow:0 30px 60px rgba(24,38,58,.22)}
  .phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
  .chip{display:inline-block;padding:10px 22px;border-radius:10px;font-weight:700;font-size:30px;color:#fff;transform:rotate(-2deg);box-shadow:0 4px 10px rgba(0,0,0,.18)}
`;
const frame = (n) => `<div class="phone"><img src="${shot(n)}"></div>`;

const cover = `<div style="display:flex;height:1000px;align-items:center;padding:0 110px;gap:70px">
  <div style="flex:1">
    <div style="font-size:128px;font-weight:700;letter-spacing:-.02em;line-height:1">Label Lens</div>
    <div style="font-size:44px;color:var(--soft);margin-top:30px;line-height:1.25">Point your phone at any label. Learn what it means for <b style="color:var(--ink)">you</b>.</div>
    <div style="margin-top:56px;display:flex;flex-direction:column;gap:16px;align-items:flex-start">
      <span class="chip" style="background:var(--red)">Contains peanuts</span>
      <span class="chip" style="background:var(--yellow);color:var(--ink);transform:rotate(1.5deg)">Interacts with warfarin</span>
    </div>
  </div>
  <div style="transform:scale(.98)">${frame("readme-2-result")}</div>
</div>`;

const plain = (n, caption) => `<div style="height:1000px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
  <div style="transform:scale(.9);margin:-42px 0">${frame(n)}</div>
  <div style="font-size:44px;font-weight:700">${caption}</div></div>`;

const pages = [
  ["01-cover", cover],
  ["02-home", plain("readme-1-home", "Point at a label")],
  ["03-result", plain("readme-2-result", "Warnings made for you")],
  ["04-evidence", plain("readme-3-evidence", "Every warning quotes the label")],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
for (const [name, body] of pages) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${CSS}</style></head><body>${body}</body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot();
  await sharp(buf).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
}
await browser.close();
