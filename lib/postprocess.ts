import type { Analysis, PersonalFlag } from "./schema";

type Verdict = Analysis["safeForYou"];

const PHARMACIST_RE = /pharmac|farmac/i;
const PHARMACIST_LINE: Record<string, string> = {
  en: "Confirm with a pharmacist.",
  es: "Confirma con un farmacéutico.",
};

/** Verdict implied by the flags. A model "unknown" is never upgraded: it means the label or profile was not enough. */
export function deriveSafeForYou(original: Verdict, flags: readonly PersonalFlag[]): Verdict {
  if (original === "unknown") return "unknown";
  if (flags.some((f) => f.severity === "danger")) return "no";
  if (flags.some((f) => f.severity === "caution")) return "check";
  return "yes";
}

function clampInteraction(flag: PersonalFlag, language: string): PersonalFlag {
  if (flag.kind !== "interaction") return flag;
  const severity = flag.severity === "danger" ? "caution" : flag.severity;
  const explanation = PHARMACIST_RE.test(flag.explanation)
    ? flag.explanation
    : `${flag.explanation} ${PHARMACIST_LINE[language] ?? PHARMACIST_LINE.en}`.trim();
  return { ...flag, severity, explanation };
}

/**
 * Post-parse safety net: drop anything without quotable evidence, cap interaction
 * flags at "caution" with a pharmacist line, and keep the verdict consistent.
 */
export function enforceSafetyRules(analysis: Analysis, language: string): Analysis {
  const personalFlags = analysis.personalFlags
    .filter((f) => f.evidence.trim().length > 0)
    .map((f) => clampInteraction(f, language));
  const labelWarnings = analysis.labelWarnings.filter((w) => w.evidence.trim().length > 0);
  return {
    ...analysis,
    personalFlags,
    labelWarnings,
    safeForYou: deriveSafeForYou(analysis.safeForYou, personalFlags),
  };
}
