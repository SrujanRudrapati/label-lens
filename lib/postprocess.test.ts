import { describe, expect, test } from "vitest";
import { deriveSafeForYou, enforceSafetyRules } from "./postprocess";
import type { Analysis, PersonalFlag } from "./schema";

const flag = (over: Partial<PersonalFlag>): PersonalFlag => ({
  severity: "caution",
  kind: "other",
  title: "t",
  explanation: "e",
  evidence: "Contains: peanuts",
  profileMatch: "peanut",
  ...over,
});

const analysis = (flags: PersonalFlag[], safeForYou: Analysis["safeForYou"] = "no"): Analysis => ({
  labelType: "medicine",
  productName: "X",
  readable: true,
  language: "en",
  summary: "s",
  personalFlags: flags,
  labelWarnings: [],
  keyFacts: [],
  safeForYou,
  confidence: "high",
  disclaimer: null,
});

describe("enforceSafetyRules", () => {
  test("drops flags whose evidence is blank", () => {
    const out = enforceSafetyRules(analysis([flag({ evidence: "   " }), flag({})]), "en");
    expect(out.personalFlags).toHaveLength(1);
  });

  test("caps interaction flags at caution and appends a pharmacist line", () => {
    const out = enforceSafetyRules(analysis([flag({ kind: "interaction", severity: "danger" })]), "en");
    expect(out.personalFlags[0]).toMatchObject({ severity: "caution" });
    expect(out.personalFlags[0]?.explanation).toMatch(/pharmacist/i);
    expect(out.safeForYou).toBe("check");
  });

  test("does not duplicate an existing pharmacist mention", () => {
    const explanation = "Ask your pharmacist first.";
    const out = enforceSafetyRules(analysis([flag({ kind: "interaction", explanation })]), "en");
    expect(out.personalFlags[0]?.explanation).toBe(explanation);
  });

  test("uses Spanish pharmacist line for es", () => {
    const out = enforceSafetyRules(analysis([flag({ kind: "interaction" })]), "es");
    expect(out.personalFlags[0]?.explanation).toMatch(/farmac/i);
  });
});

describe("deriveSafeForYou", () => {
  test("never upgrades unknown", () => expect(deriveSafeForYou("unknown", [])).toBe("unknown"));
  test("danger wins", () => expect(deriveSafeForYou("yes", [flag({ severity: "danger" })])).toBe("no"));
  test("no flags is yes", () => expect(deriveSafeForYou("no", [])).toBe("yes"));
});
