import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { POST as analyze } from "./route";
import { POST as quick } from "../quick/route";
import { POST as ask } from "../ask/route";
import type { Analysis, PersonalFlag, Profile } from "@/lib/schema";

const JPEG_B64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46]).toString("base64");

const flag = (over: Partial<PersonalFlag>): PersonalFlag => ({
  severity: "danger",
  kind: "allergen",
  title: "Contains peanuts",
  stickerTitle: "Contains peanuts",
  explanation: "Peanuts are listed.",
  evidence: "Contains: peanuts",
  profileMatch: "peanut",
  ...over,
});

const recordedAnalysis: Analysis = {
  labelType: "food",
  productName: "Test Bites",
  readable: true,
  language: "en",
  summary: "A snack.",
  personalFlags: [flag({}), flag({ kind: "interaction", severity: "caution", profileMatch: "warfarin", evidence: "ibuprofen" })],
  labelWarnings: [{ severity: "info", stickerTitle: "Store dry", text: "Store dry.", evidence: "Store in a dry place" }],
  keyFacts: [],
  safeForYou: "no",
  confidence: "high",
  disclaimer: null,
};

const recordedWith: Profile = { allergies: ["peanut"], medications: ["warfarin"], diet: [], language: "en" };
const emptyProfile: Profile = { allergies: [], medications: [], diet: [], language: "en" };

function post(url: string, body: unknown): Request {
  return new Request(`http://localhost${url}`, { method: "POST", body: JSON.stringify(body) });
}

const analyzeBody = (profile: Profile, over: object = {}) => ({
  image: JPEG_B64,
  profile,
  language: "en",
  sampleId: "snack",
  ...over,
});

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), "ll-fixtures-"));
  process.env.MOCK_AI = "1";
  process.env.FIXTURES_DIR = dir;
  writeFileSync(
    path.join(dir, "snack.en.json"),
    JSON.stringify({
      sampleId: "snack",
      language: "en",
      recordedWith,
      quick: { readable: true, labelType: "food", productName: "Test Bites" },
      analysis: recordedAnalysis,
    }),
  );
});

afterAll(() => {
  delete process.env.MOCK_AI;
  delete process.env.FIXTURES_DIR;
});

describe("POST /api/analyze (mock mode)", () => {
  test("returns the matching flags for a profile that has the allergy and the medication", async () => {
    const res = await analyze(post("/api/analyze", analyzeBody(recordedWith)));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.source).toBe("saved");
    expect(json.analysis.personalFlags).toHaveLength(2);
    expect(json.analysis.safeForYou).toBe("no");
  });

  test("keeps only flags for the current profile and recomputes the verdict", async () => {
    const res = await analyze(post("/api/analyze", analyzeBody({ ...emptyProfile, medications: ["Warfarin 5mg"] })));
    const { analysis } = await res.json();
    expect(analysis.personalFlags.map((f: PersonalFlag) => f.profileMatch)).toEqual(["warfarin"]);
    expect(analysis.safeForYou).toBe("check");
    expect(analysis.summary).toBe(recordedAnalysis.summary);
  });

  test("an empty profile gets no personal flags and a yes verdict", async () => {
    const { analysis } = await (await analyze(post("/api/analyze", analyzeBody(emptyProfile)))).json();
    expect(analysis.personalFlags).toEqual([]);
    expect(analysis.safeForYou).toBe("yes");
  });

  test("a real photo in mock mode gets the clear try-a-sample message", async () => {
    const res = await analyze(post("/api/analyze", analyzeBody(emptyProfile, { sampleId: undefined })));
    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toMatch(/No API key here\. Try a sample\./);
  });

  test("rejects a malformed body with 400", async () => {
    const res = await analyze(post("/api/analyze", { image: JPEG_B64 }));
    expect(res.status).toBe(400);
  });

  test("rejects an oversize body with 413", async () => {
    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "content-length": String(5 * 1024 * 1024) },
      body: "{}",
    });
    expect((await analyze(req)).status).toBe(413);
  });
});

describe("POST /api/quick (mock mode)", () => {
  test("replays the recorded quick read for a sample", async () => {
    const res = await quick(post("/api/quick", { image: JPEG_B64, sampleId: "snack" }));
    expect(await res.json()).toMatchObject({ source: "saved", quick: { productName: "Test Bites" } });
  });
});

describe("POST /api/ask", () => {
  const askBody = (question: string) => ({ question, analysis: recordedAnalysis, profile: emptyProfile, language: "en" });

  test("streams the canned answer in mock mode", async () => {
    const text = await (await ask(post("/api/ask", askBody("Is it spicy?")))).text();
    expect(text).toMatch(/saved example answer/);
  });

  test("answers emergencies with the fixed emergency message before any model call", async () => {
    const text = await (await ask(post("/api/ask", askBody("My child swallowed some of these")))).text();
    expect(text).toMatch(/emergency services or poison control/);
  });
});
