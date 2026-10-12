// Assembles the final 1920x1080 video: slides and phone recordings, burned-in captions, narration, no music.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SEGMENTS } from "./segments.mjs";
import { BUILD, FFMPEG, FFPROBE, OUT, PHONE } from "./paths.mjs";

const FPS = 30;
const AUDIO_DELAY = 0.4;
const TAIL = 0.6;
const assets = path.join(BUILD, "assets");
const segDir = path.join(BUILD, "segments");
mkdirSync(segDir, { recursive: true });

const durations = JSON.parse(readFileSync(path.join(BUILD, "audio/durations.json"), "utf8"));
const captions = JSON.parse(readFileSync(path.join(assets, "captions.json"), "utf8"));

const run = (args) => execFileSync(FFMPEG, ["-y", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const probe = (file) =>
  Number(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

/** Caption windows across the narration, sized by character count. */
function windows(id, audioSec) {
  const chunks = captions[id];
  const total = chunks.reduce((n, c) => n + c.text.length, 0);
  let t = AUDIO_DELAY;
  return chunks.map((c) => {
    const len = (c.text.length / total) * audioSec;
    const w = { file: path.join(assets, c.file), from: t, to: t + len };
    t += len;
    return w;
  });
}

function buildSegment(seg) {
  const audioSec = durations[seg.id];
  const audio = path.join(BUILD, "audio", `${seg.id}.wav`);
  const isSlide = seg.kind === "slide";
  const videoFile = path.join(BUILD, "video", `${seg.id}.webm`);
  const videoSec = isSlide ? 0 : probe(videoFile);
  const duration = Math.max(videoSec, AUDIO_DELAY + audioSec + TAIL);
  const wins = windows(seg.id, audioSec);
  const out = path.join(segDir, `${seg.id}.mp4`);

  const inputs = [];
  const filters = [];
  let n = 0;
  const add = (...args) => (inputs.push(...args), n++);

  if (isSlide) {
    add("-loop", "1", "-framerate", String(FPS), "-i", path.join(assets, `slide-${seg.slide}.png`));
    filters.push(`[0:v]format=yuv420p[base]`);
  } else {
    add("-loop", "1", "-framerate", String(FPS), "-i", path.join(assets, "bg.png"));
    add("-i", videoFile);
    add("-loop", "1", "-framerate", String(FPS), "-i", path.join(assets, "frame.png"));
    filters.push(
      `[1:v]fps=${FPS},scale=${PHONE.w}:${PHONE.h}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${Math.max(0, duration - videoSec + 1).toFixed(2)}[ph]`,
      `[0:v][ph]overlay=${PHONE.x}:${PHONE.y}:shortest=0[a]`,
      `[a][2:v]overlay=0:0[base]`,
    );
  }
  let last = "base";
  wins.forEach((w, i) => {
    const idx = n;
    add("-loop", "1", "-framerate", String(FPS), "-i", w.file);
    filters.push(`[${last}][${idx}:v]overlay=0:0:enable='between(t,${w.from.toFixed(2)},${w.to.toFixed(2)})'[c${i}]`);
    last = `c${i}`;
  });
  const audioIdx = n;
  add("-i", audio);
  filters.push(`[${audioIdx}:a]adelay=${Math.round(AUDIO_DELAY * 1000)},apad,aresample=44100[aud]`);

  run([
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", `[${last}]`, "-map", "[aud]",
    "-t", duration.toFixed(2),
    "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "1",
    out,
  ]);
  console.log(seg.id, duration.toFixed(1) + "s");
  return out;
}

const only = process.argv.slice(2);
const files = SEGMENTS.map((seg) => (only.length && !only.includes(seg.id) ? path.join(segDir, `${seg.id}.mp4`) : buildSegment(seg)));
const list = path.join(BUILD, "concat.txt");
writeFileSync(list, files.map((f) => `file '${f}'`).join("\n"));
const final = path.join(OUT, "label-lens-demo.mp4");
run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final]);
const total = probe(final);
console.log(`final ${final}: ${Math.floor(total / 60)}:${(total % 60).toFixed(1).padStart(4, "0")} (${total.toFixed(1)}s)`);
if (total >= 175) { console.error("TOO LONG: must be under 2:55"); process.exit(1); }
