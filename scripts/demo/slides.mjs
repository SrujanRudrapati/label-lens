// Slides, phone frame and caption strips, rendered with Playwright from the app's design tokens and font.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { SEGMENTS, LIVE_URL, captionOf } from "./segments.mjs";
import { BUILD, CANVAS, PHONE, FRAME_PAD, CAPTION_TOP } from "./paths.mjs";

const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">`;
const BASE_CSS = `
  :root{--paper:#FAFBFC;--ink:#18263A;--soft:#4A5A70;--rule:#DCE2EA;--yellow:#FFD23F;--red:#E5484D;--blue:#3E7BFA;--green:#2FA36B}
  *{box-sizing:border-box;margin:0}
  html,body{width:${CANVAS.w}px;height:${CANVAS.h}px;font-family:'Atkinson Hyperlegible',system-ui,sans-serif;color:var(--ink);line-height:1.3}
  body{background:var(--paper);position:relative;overflow:hidden}
  .sticker{display:inline-flex;align-items:center;gap:18px;padding:18px 30px;border-radius:12px;font-weight:700;font-size:44px;
    box-shadow:0 2px 0 rgba(24,38,58,.25),0 14px 28px -12px rgba(24,38,58,.4);outline:6px solid #fff}
  .red{background:var(--red);color:#fff}.yellow{background:var(--yellow);color:var(--ink)}.blue{background:var(--blue);color:#fff}.green{background:var(--green);color:var(--ink)}
  .sticker svg{width:46px;height:46px;flex:none}
`;
const ICON = {
  danger: `<svg viewBox="0 0 24 24"><path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 7v6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>`,
  caution: `<svg viewBox="0 0 24 24"><path d="M12 2.8 22.2 20.5H1.8z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 9.5v5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.4" fill="currentColor"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1.5" fill="currentColor"/></svg>`,
};
const sticker = (tone, icon, text, rot) => `<span class="sticker ${tone}" style="transform:rotate(${rot}deg)">${ICON[icon]}${text}</span>`;

const SLIDES = {
  title: `
    <div style="position:absolute;left:150px;top:230px;width:900px">
      <div style="font-size:150px;font-weight:700;letter-spacing:-.02em;line-height:1">Label Lens</div>
      <div style="font-size:52px;color:var(--soft);margin-top:34px;max-width:820px">Point at a label. We&rsquo;ll explain what it means for you.</div>
      <div style="font-size:34px;margin-top:70px;color:var(--soft)">Srujan &middot; All U Can Do With AI</div>
    </div>
    <div style="position:absolute;left:1090px;top:260px;display:flex;flex-direction:column;gap:38px;align-items:flex-start">
      ${sticker("red", "danger", "Contains peanuts", -3.5)}
      <div style="margin-left:70px">${sticker("yellow", "caution", "Interacts with warfarin", 2.5)}</div>
      <div style="margin-left:20px">${sticker("blue", "info", "Keep out of reach of children", -1.5)}</div>
    </div>`,
  how: `
    <div style="position:absolute;left:150px;top:90px;right:150px">
      <div style="font-size:84px;font-weight:700;letter-spacing:-.01em">How the AI works</div>
      <div style="display:flex;align-items:center;gap:44px;margin-top:56px">
        <div style="width:250px;height:250px;border-radius:18px;background:#E9EDF2;border:2px solid var(--rule);display:grid;place-items:center;font-size:36px;font-weight:700;text-align:center;padding:20px">One photo of the label</div>
        <div style="font-size:70px;color:var(--soft)">&rarr;</div>
        <div style="display:flex;flex-direction:column;gap:26px;flex:1">
          <div style="border-left:14px solid var(--blue);background:#fff;padding:22px 34px;border-radius:0 14px 14px 0;box-shadow:0 1px 0 var(--rule)">
            <div style="font-size:44px;font-weight:700">Claude Haiku <span style="color:var(--soft);font-weight:400">&middot; instant</span></div>
            <div style="font-size:34px;color:var(--soft);margin-top:6px">Product name, label type, readable or not</div></div>
          <div style="border-left:14px solid var(--yellow);background:#fff;padding:22px 34px;border-radius:0 14px 14px 0;box-shadow:0 1px 0 var(--rule)">
            <div style="font-size:44px;font-weight:700">Claude Sonnet <span style="color:var(--soft);font-weight:400">&middot; deep analysis</span></div>
            <div style="font-size:34px;color:var(--soft);margin-top:6px">Vision, structured JSON, checked against your profile</div></div>
        </div>
        <div style="font-size:70px;color:var(--soft)">&rarr;</div>
        <div style="width:290px;display:flex;flex-direction:column;gap:14px;align-items:flex-start">
          ${sticker("red", "danger", "Stickers", -3)}<span style="font-size:32px;color:var(--soft)">with the label&rsquo;s own words</span></div>
      </div>
      <div style="display:flex;gap:30px;margin-top:64px">
        ${[
          ["Haiku and Sonnet run in parallel", "The first read shows while the deep analysis finishes."],
          ["Every warning quotes the label", "No quote, no warning. Output is validated with zod."],
          ["Your profile stays on your device", "Saved in the browser. No account, no server copy."],
        ]
          .map(([h, p]) => `<div style="flex:1;border-top:6px solid var(--ink);padding-top:20px"><div style="font-size:38px;font-weight:700">${h}</div><div style="font-size:30px;color:var(--soft);margin-top:8px">${p}</div></div>`)
          .join("")}
      </div>
    </div>`,
  close: `
    <div style="position:absolute;left:150px;top:150px;right:150px">
      <div style="font-size:130px;font-weight:700;letter-spacing:-.02em;line-height:1">Label Lens</div>
      <div style="font-size:60px;color:var(--soft);margin-top:26px">Read the fine print for you.</div>
      <div style="margin-top:80px;display:flex;flex-direction:column;gap:30px">
        <div><div style="font-size:30px;color:var(--soft)">Try it</div><div style="font-size:64px;font-weight:700">${LIVE_URL.replace("https://", "")}</div></div>
        <div><div style="font-size:30px;color:var(--soft)">Code</div><div style="font-size:50px;font-weight:700">github.com/SrujanRudrapati/label-lens</div></div>
      </div>
      <div style="position:absolute;right:0;top:20px;display:flex;flex-direction:column;gap:30px;align-items:flex-end">
        ${sticker("green", "info", "Free to run, no account", 2)}
      </div>
    </div>`,
};

const page = (body, css = "") => `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${BASE_CSS}${css}</style></head><body>${body}</body></html>`;

/** Splits narration into caption lines of at most ~100 characters, preferring sentence and comma breaks. */
export function captionChunks(text, max = 100) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [text];
  const chunks = [];
  for (const s of sentences) {
    if (s.length <= max) { chunks.push(s); continue; }
    let rest = s;
    while (rest.length > max) {
      const cut = rest.lastIndexOf(", ", max) > 30 ? rest.lastIndexOf(", ", max) + 1 : rest.lastIndexOf(" ", max);
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

async function main() {
  const dir = path.join(BUILD, "assets");
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: CANVAS.w, height: CANVAS.h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const shot = async (html, file, omitBackground = false) => {
    await p.setContent(html, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(dir, file), omitBackground });
  };

  for (const [name, body] of Object.entries(SLIDES)) await shot(page(body), `slide-${name}.png`);

  // Phone backdrop is plain paper; the ring is drawn above the video so its square corners are hidden.
  await shot(page(""), "bg.png");
  const ring = `<div style="position:absolute;left:${PHONE.x - FRAME_PAD}px;top:${PHONE.y - FRAME_PAD}px;width:${PHONE.w + 2 * FRAME_PAD}px;height:${PHONE.h + 2 * FRAME_PAD}px;border:${FRAME_PAD}px solid var(--ink);border-radius:52px"></div>`;
  await shot(page(ring, "body{background:transparent}"), "frame.png", true);

  const captions = {};
  for (const seg of SEGMENTS) {
    captions[seg.id] = [];
    const chunks = captionChunks(captionOf(seg));
    for (const [i, text] of chunks.entries()) {
      const file = `cap-${seg.id}-${i}.png`;
      const box = `<div style="position:absolute;left:160px;right:160px;top:${CAPTION_TOP}px;height:100px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:40px;font-weight:700;line-height:1.25">${text}</div>`;
      await shot(page(box, "body{background:transparent}"), file, true);
      captions[seg.id].push({ file, text });
    }
  }
  writeFileSync(path.join(dir, "captions.json"), JSON.stringify(captions, null, 2));
  await browser.close();
  console.log("slides, frame and", Object.values(captions).flat().length, "caption strips rendered");
}

main();
