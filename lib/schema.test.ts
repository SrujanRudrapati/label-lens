import { describe, expect, test } from "vitest";
import { z } from "zod";
import { Analysis, AnalyzeRequest, AskRequest, DEFAULT_PROFILE, Profile, QuickResult } from "./schema";

const validAnalysis = {
  labelType: "food",
  productName: "Peanut Butter Bites",
  readable: true,
  language: "en",
  summary: "A peanut snack.",
  personalFlags: [
    {
      severity: "danger",
      kind: "allergen",
      title: "Contains peanuts",
      stickerTitle: "Contains peanuts",
      explanation: "You listed a peanut allergy.",
      evidence: "Contains: peanuts, soy",
      profileMatch: "peanut",
    },
  ],
  labelWarnings: [{ severity: "info", stickerTitle: "Keep dry", text: "Keep dry.", evidence: "Store in a dry place" }],
  keyFacts: [{ label: "Serving", value: "30 g" }],
  safeForYou: "no",
  confidence: "high",
  disclaimer: null,
};

describe("QuickResult", () => {
  test("accepts a valid quick result", () => {
    expect(QuickResult.safeParse({ readable: true, labelType: "medicine", productName: null }).success).toBe(true);
  });

  test("rejects an unknown label type", () => {
    expect(QuickResult.safeParse({ readable: true, labelType: "car", productName: "x" }).success).toBe(false);
  });
});

describe("Analysis", () => {
  test("accepts a valid analysis", () => {
    expect(Analysis.safeParse(validAnalysis).success).toBe(true);
  });

  test("rejects a flag with empty evidence", () => {
    const bad = { ...validAnalysis, personalFlags: [{ ...validAnalysis.personalFlags[0], evidence: "" }] };
    expect(Analysis.safeParse(bad).success).toBe(false);
  });

  test("rejects a label warning with missing evidence", () => {
    const bad = { ...validAnalysis, labelWarnings: [{ severity: "info", stickerTitle: "Keep dry", text: "Keep dry." }] };
    expect(Analysis.safeParse(bad).success).toBe(false);
  });

  test("rejects an invalid safeForYou value", () => {
    expect(Analysis.safeParse({ ...validAnalysis, safeForYou: "maybe" }).success).toBe(false);
  });

  test("rejects oversized arrays and strings", () => {
    const tooMany = Array.from({ length: 13 }, () => validAnalysis.keyFacts[0]);
    expect(Analysis.safeParse({ ...validAnalysis, keyFacts: tooMany }).success).toBe(false);
    expect(Analysis.safeParse({ ...validAnalysis, summary: "x".repeat(801) }).success).toBe(false);
  });

  test("converts to JSON schema for tool definitions", () => {
    const json = z.toJSONSchema(Analysis) as { type: string; properties: Record<string, unknown> };
    expect(json.type).toBe("object");
    expect(Object.keys(json.properties)).toContain("personalFlags");
  });
});

describe("Profile", () => {
  test("default profile is valid", () => {
    expect(Profile.safeParse(DEFAULT_PROFILE).success).toBe(true);
  });

  test("trims items and rejects empty ones", () => {
    const ok = Profile.parse({ ...DEFAULT_PROFILE, allergies: ["  peanut "] });
    expect(ok.allergies).toEqual(["peanut"]);
    expect(Profile.safeParse({ ...DEFAULT_PROFILE, allergies: ["   "] }).success).toBe(false);
  });

  test("rejects corrupted data", () => {
    expect(Profile.safeParse({ allergies: "peanut" }).success).toBe(false);
    expect(Profile.safeParse(null).success).toBe(false);
  });
});

describe("request bodies", () => {
  test("analyze request requires an image and a profile", () => {
    expect(AnalyzeRequest.safeParse({ image: "abc", profile: DEFAULT_PROFILE, language: "en" }).success).toBe(true);
    expect(AnalyzeRequest.safeParse({ profile: DEFAULT_PROFILE, language: "en" }).success).toBe(false);
  });

  test("analyze request rejects unknown sample ids", () => {
    const body = { image: "abc", profile: DEFAULT_PROFILE, language: "en", sampleId: "nope" };
    expect(AnalyzeRequest.safeParse(body).success).toBe(false);
  });

  test("ask request caps question length", () => {
    const base = { analysis: validAnalysis, profile: DEFAULT_PROFILE, language: "en" };
    expect(AskRequest.safeParse({ ...base, question: "Is it safe?" }).success).toBe(true);
    expect(AskRequest.safeParse({ ...base, question: "x".repeat(501) }).success).toBe(false);
  });
});
