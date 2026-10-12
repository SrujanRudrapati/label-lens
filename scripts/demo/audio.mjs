// Narration: macOS `say` with the best installed English voice, one audio file per segment.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SEGMENTS } from "./segments.mjs";
import { BUILD, FFMPEG, FFPROBE } from "./paths.mjs";

const VOICE = process.env.DEMO_VOICE ?? "Ava (Enhanced)"; // the only Premium/Enhanced English voice installed
const RATE = process.env.DEMO_RATE ?? "156"; // words per minute

mkdirSync(path.join(BUILD, "audio"), { recursive: true });
const durations = {};
for (const seg of SEGMENTS) {
  const aiff = path.join(BUILD, "audio", `${seg.id}.aiff`);
  const wav = path.join(BUILD, "audio", `${seg.id}.wav`);
  execFileSync("say", ["-v", VOICE, "-r", RATE, "-o", aiff, seg.spoken]);
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", "-ac", "1", wav]);
  const out = execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString().trim();
  durations[seg.id] = Number(out);
  console.log(seg.id, durations[seg.id].toFixed(1) + "s");
}
writeFileSync(path.join(BUILD, "audio", "durations.json"), JSON.stringify(durations, null, 2));
console.log("total narration", Object.values(durations).reduce((a, b) => a + b, 0).toFixed(1) + "s");
