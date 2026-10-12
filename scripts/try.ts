/**
 * Runs samples through quick + analyze (in parallel, like the app) against the real API.
 *   npm run try -- snack ibuprofen --lang en,es      print JSON, stage to .try-out/
 *   npm run try -- all --save                        also write fixtures/
 *   npm run try -- --promote                         copy reviewed .try-out/ files to fixtures/ (no API calls)
 */
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runAnalysis, runQuick } from "../lib/pipeline";
import { Fixture } from "../lib/mock";
import type { Profile } from "../lib/schema";

const SAMPLE_IDS = ["snack", "snack-es", "ibuprofen", "cleaner", "blurry"] as const;
const STAGE_DIR = path.join(process.cwd(), ".try-out");
const FIXTURE_DIR = path.join(process.cwd(), "fixtures");

/** Superset of everything the demo needs, so replay can filter down to any smaller profile. */
const RECORDING_PROFILE = (language: string): Profile => ({
  allergies: ["peanut", "tree nuts"],
  medications: ["warfarin"],
  diet: ["vegan"],
  language,
});

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function option(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function record(sampleId: string, language: string): Promise<Fixture> {
  const jpeg = await readFile(path.join(process.cwd(), "public", "samples", `${sampleId}.jpg`));
  const image = jpeg.toString("base64");
  const profile = RECORDING_PROFILE(language);
  const started = Date.now();
  let quickMs = 0;
  const [quick, analysis] = await Promise.all([
    runQuick(image).then((r) => ((quickMs = Date.now() - started), r)),
    runAnalysis(image, profile, language),
  ]);
  console.error(`${sampleId}.${language}: quick ${quickMs}ms, analysis ${Date.now() - started}ms`);
  return Fixture.parse({ sampleId, language, recordedWith: profile, quick, analysis });
}

async function promote(): Promise<void> {
  await mkdir(FIXTURE_DIR, { recursive: true });
  for (const file of (await readdir(STAGE_DIR)).filter((f) => f.endsWith(".json"))) {
    Fixture.parse(JSON.parse(await readFile(path.join(STAGE_DIR, file), "utf8")));
    await copyFile(path.join(STAGE_DIR, file), path.join(FIXTURE_DIR, file));
    console.error(`promoted ${file}`);
  }
}

async function main(): Promise<void> {
  if (flag("promote")) return promote();

  const names = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--lang");
  const samples = names.length === 0 || names.includes("all") ? [...SAMPLE_IDS] : names;
  const languages = (option("lang") ?? "en").split(",");
  const save = flag("save");

  await mkdir(STAGE_DIR, { recursive: true });
  if (save) await mkdir(FIXTURE_DIR, { recursive: true });

  for (const sampleId of samples) {
    for (const language of languages) {
      const fixture = await record(sampleId, language);
      const json = JSON.stringify(fixture, null, 2) + "\n";
      await writeFile(path.join(STAGE_DIR, `${sampleId}.${language}.json`), json);
      if (save) await writeFile(path.join(FIXTURE_DIR, `${sampleId}.${language}.json`), json);
      console.log(json);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
