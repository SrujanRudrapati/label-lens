// Regenerates the README screenshots: phone viewport only, mock mode. Needs `MOCK_AI=1 npx next dev -p 3100`.
import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = "http://localhost:3100";
const OUT = "docs/screenshots";
const PROFILE = { allergies: ["peanut", "tree nuts"], medications: ["warfarin"], diet: ["vegan"], language: "en" };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((p) => {
  localStorage.setItem("label-lens:profile", JSON.stringify(p));
  localStorage.setItem("label-lens:setup-done", "1");
}, PROFILE);
const page = await ctx.newPage();

async function save(name) {
  const buf = await page.screenshot({ fullPage: false });
  await sharp(buf).png({ palette: true, quality: 85, compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
}

await page.goto(BASE);
await page.getByRole("button", { name: "Scan a label" }).waitFor();
await page.waitForTimeout(600);
await save("readme-1-home");

await page.getByRole("button", { name: "Snack bar" }).click();
const peanut = page.getByRole("button", { name: /^Contains peanuts\. Danger/ });
await peanut.waitFor();
await page.waitForTimeout(2500);
await save("readme-2-result");

await peanut.click();
await page.locator("#evidence").waitFor();
await page.waitForTimeout(1200);
await save("readme-3-evidence");
await browser.close();
