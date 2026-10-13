// Regenerates the phone screens on the landing page (public/landing/*.webp) from the real app in mock mode.
// Needs `MOCK_AI=1 npx next dev -p 3100` running, then: node scripts/landing-shots.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { statSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = "public/landing";
const MAX_BYTES = 150 * 1024;
const PROFILE = { allergies: ["peanut", "tree nuts"], medications: ["warfarin"], diet: ["vegan"], language: "en" };

async function save(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ animations: "disabled" });
  const file = `${OUT}/${name}.webp`;
  for (const quality of [80, 72, 64, 56]) {
    await sharp(buf).webp({ quality, effort: 6 }).toFile(file);
    if (statSync(file).size <= MAX_BYTES) break;
  }
  const kb = Math.round(statSync(file).size / 1024);
  if (kb * 1024 > MAX_BYTES) throw new Error(`${file} is ${kb} KB, over the 150 KB budget`);
  console.log(`${file} ${kb} KB`);
}

async function newPage(browser, { setupDone }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await ctx.addInitScript(
    ([p, done]) => {
      localStorage.setItem("label-lens:profile", JSON.stringify(p));
      if (done) localStorage.setItem("label-lens:setup-done", "1");
    },
    [PROFILE, setupDone],
  );
  return ctx.newPage();
}

const browser = await chromium.launch();

// 1. First-run profile, filled in with the demo profile.
const setup = await newPage(browser, { setupDone: false });
await setup.goto(BASE);
await setup.getByRole("heading", { name: "What should we watch for?" }).waitFor();
await save(setup, "profile");

// 2–6. Home, first read, result, evidence, ask.
const page = await newPage(browser, { setupDone: true });
let releaseAnalyze = () => {};
const analyzeHeld = new Promise((resolve) => (releaseAnalyze = resolve));
await page.route("**/api/analyze", async (route) => {
  await analyzeHeld;
  await route.continue();
});

await page.goto(BASE);
await page.getByRole("button", { name: "Scan a label" }).first().waitFor();
// Only the images on screen; the landing's own phone screens further down load lazily (and may not exist yet).
await page.waitForFunction(() =>
  [...document.images].filter((img) => img.getBoundingClientRect().top < innerHeight).every((img) => img.complete && img.naturalWidth > 0),
);
await save(page, "home");

await page.getByRole("button", { name: "Snack bar" }).click();
await page.getByRole("heading", { level: 1, name: "Trailhead Crunch Honey Peanut Bar" }).waitFor();
await page.getByText("Checking against your profile").waitFor();
await save(page, "first-read");

releaseAnalyze();
const peanut = page.getByRole("button", { name: /^Contains peanuts\. Danger/ });
await peanut.waitFor();
await page.waitForTimeout(800);
await save(page, "result");

await peanut.click();
await page.locator("#evidence").waitFor();
await page.locator("#evidence").evaluate((el) => el.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -110));
await save(page, "evidence");

await page.getByRole("button", { name: "Close" }).click();
await page.getByLabel("Your question about this label").fill("Is this safe for my peanut allergy?");
await page.getByRole("button", { name: "Ask", exact: true }).click();
await page.getByText(/saved example answer/).waitFor();
// Wait for the streamed answer to finish.
await page.locator('[aria-busy="false"]').waitFor();
await page.locator("#ask-heading").evaluate((el) => el.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -24));
await save(page, "ask");

await browser.close();
