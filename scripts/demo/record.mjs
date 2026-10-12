// Records the app segments with Playwright against a local production build using the REAL API.
//   npm run build && PORT=3200 npm start        (no MOCK_AI; SAMPLES_USE_FIXTURES unset)
//   node scripts/demo/record.mjs [segment-id ...]
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { SEGMENTS } from "./segments.mjs";
import { BUILD, ROOT } from "./paths.mjs";

const BASE = process.env.DEMO_BASE ?? "http://localhost:3200";
const STATE = path.join(BUILD, "state.json");
const VIDEO_DIR = path.join(BUILD, "video");
const SAMPLE = (id) => path.join(ROOT, "public/samples", `${id}.jpg`);
const durations = JSON.parse(readFileSync(path.join(BUILD, "audio/durations.json"), "utf8"));
const SETTLE_MS = 700;

// Recording-only helpers: a visible tap ring (the video has no cursor), and a stand-in for speechSynthesis
// when the headless browser has no voices, so the Read aloud button shows its speaking state.
const INIT = `
  addEventListener('pointerdown', (e) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:4px solid #18263A;background:rgba(24,38,58,.18);left:'+e.clientX+'px;top:'+e.clientY+'px;transition:transform .5s ease-out,opacity .5s ease-out';
    document.documentElement.appendChild(d);
    requestAnimationFrame(() => { d.style.transform = 'scale(1.6)'; d.style.opacity = '0'; });
    setTimeout(() => d.remove(), 600);
  }, true);
  if (${process.env.DEMO_STUB_SPEECH === "1"}) {
    const synth = window.speechSynthesis;
    synth.getVoices = () => [];
    synth.cancel = () => {};
    synth.speak = (u) => setTimeout(() => u.onend && u.onend({}), Math.min(9000, u.text.length * 55));
  }
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const upload = (page, id) => page.locator('input[type="file"]').first().setInputFiles(SAMPLE(id));

const FLOWS = {
  async "02-profile"(page) {
    await page.goto(BASE);
    await page.getByRole("heading", { name: "What should we watch for?" }).waitFor();
    await sleep(1200);
    await page.getByLabel("Add to allergies").click();
    await page.keyboard.type("peanut", { delay: 110 });
    await page.keyboard.press("Enter");
    await sleep(500);
    await page.getByLabel("Add to medicines you take").click();
    await page.keyboard.type("warfarin", { delay: 110 });
    await page.keyboard.press("Enter");
    await sleep(700);
    await page.getByText("Language for results").scrollIntoViewIfNeeded();
    await sleep(1200);
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.getByRole("button", { name: "Scan a label" }).waitFor();
    await sleep(1500);
  },

  async "03-snack"(page) {
    await page.goto(BASE);
    await page.getByRole("button", { name: "Scan a label" }).waitFor();
    await sleep(1500);
    await upload(page, "snack");
    const sticker = page.getByRole("button", { name: /^Contains peanuts/ });
    await sticker.waitFor({ timeout: 60_000 });
    await sleep(2200);
    await sticker.click();
    await page.locator("#evidence").waitFor();
    await sleep(3500);
  },

  async "04-ibuprofen"(page) {
    await page.goto(BASE);
    await page.getByRole("button", { name: "Scan a label" }).waitFor();
    await sleep(1200);
    await upload(page, "ibuprofen");
    const sticker = page.getByRole("button", { name: /warfarin/i }).first();
    await sticker.waitFor({ timeout: 60_000 });
    await sleep(2200);
    await sticker.click();
    await page.locator("#evidence").waitFor();
    await sleep(4500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await sleep(900);
    await page.getByRole("button", { name: "Read aloud" }).click();
    await sleep(4500);
  },

  async "05-spanish"(page) {
    await page.goto(BASE);
    await page.getByRole("button", { name: /Checking for/ }).click();
    await sleep(1200);
    await page.getByText("Español").click();
    await sleep(900);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await sleep(900);
    await upload(page, "ibuprofen");
    const sticker = page.locator('ul[aria-label="Warning stickers on your photo"] button').first();
    await sticker.waitFor({ timeout: 60_000 });
    await sleep(2500);
    await page.getByLabel("Your question about this label").scrollIntoViewIfNeeded();
    await sleep(800);
    await page.getByLabel("Your question about this label").click();
    await page.keyboard.type("¿Puedo tomarlo con mi medicina?", { delay: 70 });
    await sleep(500);
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[aria-busy="false"]') && /./.test(document.querySelector('[aria-busy="false"] p:last-child')?.textContent ?? ""), null, { timeout: 40_000 });
    await sleep(3500);
  },
};

async function recordOne(browser, id) {
  const hasState = id !== "02-profile" && existsSync(STATE);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: path.join(VIDEO_DIR, "raw"), size: { width: 390, height: 844 } },
    storageState: hasState ? STATE : undefined,
  });
  await context.addInitScript(INIT);
  const page = await context.newPage();
  const started = Date.now();
  await sleep(SETTLE_MS);
  await FLOWS[id](page);
  const audioMs = (durations[id] ?? 0) * 1000;
  const wait = audioMs + 600 - (Date.now() - started);
  if (wait > 0) await sleep(wait); // pace the segment to its narration
  const actionSec = (Date.now() - started) / 1000;
  if (id === "02-profile") await context.storageState({ path: STATE });
  const video = page.video();
  await context.close();
  const dest = path.join(VIDEO_DIR, `${id}.webm`);
  renameSync(await video.path(), dest);
  console.log(`${id}: recorded ${actionSec.toFixed(1)}s (narration ${(audioMs / 1000).toFixed(1)}s)`);
}

mkdirSync(path.join(VIDEO_DIR, "raw"), { recursive: true });
const wanted = process.argv.slice(2);
const ids = (wanted.length ? wanted : SEGMENTS.filter((s) => s.kind === "app").map((s) => s.id));
if (ids.includes("02-profile") && existsSync(STATE)) rmSync(STATE);
const browser = await chromium.launch();
for (const id of ids) await recordOne(browser, id);
await browser.close();
