import { describe, expect, test } from "vitest";
import { buildSpeech, chunkSpeech, pickVoice } from "./speak";
import type { Analysis } from "./schema";

const analysis: Analysis = {
  labelType: "food",
  productName: "Test Bites",
  readable: true,
  language: "en",
  summary: "A peanut snack.",
  personalFlags: [
    { severity: "danger", kind: "allergen", title: "Contains peanuts", stickerTitle: "Contains peanuts", explanation: "Matches your allergy.", evidence: "peanuts", profileMatch: "peanut" },
  ],
  labelWarnings: [{ severity: "info", stickerTitle: "Keep dry", text: "Keep dry.", evidence: "dry" }],
  keyFacts: [],
  safeForYou: "no",
  confidence: "high",
  disclaimer: null,
};

const voice = (name: string, lang: string, isDefault = false) => ({ name, lang, default: isDefault }) as SpeechSynthesisVoice;

describe("buildSpeech", () => {
  test("reads name, summary, flags and label warnings in order", () => {
    expect(buildSpeech(analysis)).toBe("Test Bites A peanut snack. Contains peanuts. Matches your allergy. Keep dry.");
  });
});

describe("chunkSpeech", () => {
  test("keeps every chunk short and loses no text", () => {
    const text = Array.from({ length: 12 }, (_, i) => `This is sentence number ${i}.`).join(" ");
    const chunks = chunkSpeech(text);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 200)).toBe(true);
    expect(chunks.join(" ")).toBe(text);
  });
});

describe("pickVoice", () => {
  test("matches the language and prefers an enhanced voice", () => {
    const voices = [voice("Plain", "es-MX"), voice("Monica (Enhanced)", "es-ES"), voice("Samantha", "en-US", true)];
    expect(pickVoice(voices, "es")?.name).toBe("Monica (Enhanced)");
  });

  test("returns null when no voice speaks the language", () => {
    expect(pickVoice([voice("Samantha", "en-US")], "es")).toBeNull();
  });
});
