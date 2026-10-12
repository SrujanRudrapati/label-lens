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

describe("severity caps", () => {
  const run = (f: Partial<PersonalFlag>, language = "en") =>
    enforceSafetyRules(analysis([flag(f)]), language).personalFlags[0];

  test("caps a diet conflict at caution", () => {
    expect(run({ kind: "diet", severity: "danger", evidence: "roasted peanuts, honey, brown rice syrup" })?.severity).toBe("caution");
  });

  test("turns a diet match from a may-contain line into info", () => {
    expect(run({ kind: "diet", severity: "caution", evidence: "May contain tree nuts, milk, wheat and sesame." })?.severity).toBe("info");
  });

  test("recognizes Spanish cross-contact lines for diet flags", () => {
    expect(run({ kind: "diet", severity: "caution", evidence: "Puede contener nueces, leche, trigo y ajonjolí." }, "es")?.severity).toBe("info");
    expect(run({ kind: "diet", severity: "caution", evidence: "Elaborado en una planta que también procesa estos alérgenos." }, "es")?.severity).toBe("info");
  });

  test("keeps an info diet flag as info", () => {
    expect(run({ kind: "diet", severity: "info", evidence: "stearic acid" })?.severity).toBe("info");
  });

  test("keeps an allergen ingredient at danger", () => {
    expect(run({ kind: "allergen", severity: "danger", evidence: "CONTAINS: PEANUTS, SOY." })?.severity).toBe("danger");
  });

  test("caps allergy cross-contact at caution, and leaves caution alone", () => {
    expect(run({ kind: "allergen", severity: "danger", evidence: "May contain tree nuts, milk" })?.severity).toBe("caution");
    expect(run({ kind: "allergen", severity: "caution", evidence: "May contain tree nuts, milk" })?.severity).toBe("caution");
  });

  test("a diet-only danger no longer drives the verdict to no", () => {
    const out = enforceSafetyRules(analysis([flag({ kind: "diet", severity: "danger", evidence: "honey" })]), "en");
    expect(out.safeForYou).toBe("check");
  });

  test("diet cross-contact info alone leaves the verdict at yes", () => {
    const out = enforceSafetyRules(
      analysis([flag({ kind: "diet", severity: "caution", evidence: "May contain milk" })], "check"),
      "en",
    );
    expect(out.safeForYou).toBe("yes");
  });
});

describe("medicine disclaimer fallback", () => {
  test("fills a missing disclaimer for medicine labels only", () => {
    expect(enforceSafetyRules(analysis([]), "en").disclaimer).toMatch(/not medical advice/);
    expect(enforceSafetyRules({ ...analysis([]), labelType: "food" }, "en").disclaimer).toBeNull();
  });

  test("keeps a model-written disclaimer verbatim", () => {
    expect(enforceSafetyRules({ ...analysis([]), disclaimer: "Mine." }, "en").disclaimer).toBe("Mine.");
  });
});

describe("deriveSafeForYou", () => {
  test("never upgrades unknown", () => expect(deriveSafeForYou("unknown", [])).toBe("unknown"));
  test("danger wins", () => expect(deriveSafeForYou("yes", [flag({ severity: "danger" })])).toBe("no"));
  test("no flags is yes", () => expect(deriveSafeForYou("no", [])).toBe("yes"));
});
