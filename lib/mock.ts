import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { isMock, samplesUseFixtures } from "./env";
import { deriveSafeForYou } from "./postprocess";
import { Analysis, Profile, QuickResult } from "./schema";
import type { AnalyzeRequest } from "./schema";

export const Fixture = z.object({
  sampleId: z.string(),
  language: z.string(),
  recordedWith: Profile,
  quick: QuickResult,
  analysis: Analysis,
});
export type Fixture = z.infer<typeof Fixture>;

const MIN_PARTIAL_MATCH = 3;

export type Source = "saved" | "live";

const FIXTURE_LANGUAGES = ["en", "es"];

export function fixturesDir(): string {
  return process.env.FIXTURES_DIR ?? path.join(process.cwd(), "fixtures");
}

/** True when this request should be answered from a recorded fixture instead of the API. */
export function shouldReplay(sampleId: string | undefined): boolean {
  return isMock() || (sampleId !== undefined && samplesUseFixtures());
}

export async function loadFixture(sampleId: string, language: string): Promise<Fixture> {
  const lang = FIXTURE_LANGUAGES.includes(language) ? language : "en";
  const raw = await readFile(path.join(fixturesDir(), `${sampleId}.${lang}.json`), "utf8");
  return Fixture.parse(JSON.parse(raw));
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function profileItems(profile: Profile): string[] {
  return [...profile.allergies, ...profile.medications, ...profile.diet].map(norm).filter(Boolean);
}

/** Case-insensitive "contains" in either direction between a flag's profileMatch and a profile item. */
export function matchesProfile(profileMatch: string, items: readonly string[]): boolean {
  const m = norm(profileMatch);
  return (
    m.length > 0 &&
    items.some((item) => {
      if (item === m) return true;
      const [short, long] = item.length < m.length ? [item, m] : [m, item];
      // A one- or two-letter profile entry must not match everything.
      return short.length >= MIN_PARTIAL_MATCH && long.includes(short);
    })
  );
}

/** Keeps only the recorded personal flags that apply to this profile; every other field stays verbatim. */
export function replayAnalysis(fixture: Fixture, profile: Profile): Analysis {
  const items = profileItems(profile);
  const personalFlags = fixture.analysis.personalFlags.filter((f) => matchesProfile(f.profileMatch, items));
  return {
    ...fixture.analysis,
    personalFlags,
    safeForYou: deriveSafeForYou(fixture.analysis.safeForYou, personalFlags),
  };
}

export async function replayAnalyze(req: AnalyzeRequest & { sampleId: string }): Promise<Analysis> {
  return replayAnalysis(await loadFixture(req.sampleId, req.language), req.profile);
}

export const ASK_MOCK_ANSWER: Record<string, string> = {
  en: "This is a saved example answer. Based on the label, check the warnings listed above, and ask a pharmacist if you are unsure.",
  es: "Esta es una respuesta de ejemplo guardada. Según la etiqueta, revisa las advertencias de arriba y consulta a un farmacéutico si tienes dudas.",
};
