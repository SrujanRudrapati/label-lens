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

/** Dropping flags must never turn a "no" or "check" into a green "yes": an unverifiable finding means we couldn't fully check. */
function guardedVerdict(original: Verdict, flags: readonly PersonalFlag[], droppedCount: number): Verdict {
  const derived = deriveSafeForYou(original, flags);
  if (derived === "yes" && droppedCount > 0 && (original === "no" || original === "check")) {
    console.warn("[postprocess] flags were dropped for missing evidence; verdict set to unknown");
    return "unknown";
  }
  return derived;
}

const MEDICINE_DISCLAIMER: Record<string, string> = {
  en: "This explains the label and is not medical advice. Ask a pharmacist or doctor if you are unsure.",
  es: "Esto explica la etiqueta y no es consejo médico. Si tienes dudas, consulta a un farmacéutico o médico.",
};

// Evidence lines that describe cross-contact rather than an ingredient (English and Spanish labels).
const CROSS_CONTACT_RE =
  /may contain|processed in|processes|facility|traces? of|manufactured (in|on)|puede contener|trazas|elaborado en|se procesa|procesa/i;

/** True only when every sentence of the quote is a cross-contact line, so "CONTAINS MILK. MAY CONTAIN PEANUT." is never softened. */
function isCrossContactOnly(evidence: string): boolean {
  const sentences = evidence.split(/(?<=[.;])\s+/).filter((x) => x.trim());
  return sentences.length > 0 && sentences.every((x) => CROSS_CONTACT_RE.test(x));
}

/** Diet conflicts are never danger; a diet match that rests only on cross-contact is general info. */
function clampDiet(flag: PersonalFlag): PersonalFlag {
  if (flag.kind !== "diet") return flag;
  if (isCrossContactOnly(flag.evidence)) return { ...flag, severity: "info" };
  return flag.severity === "danger" ? { ...flag, severity: "caution" } : flag;
}

/** Allergy cross-contact ("may contain") is a conditional risk: caution, never danger. */
function clampAllergenCrossContact(flag: PersonalFlag): PersonalFlag {
  if (flag.kind !== "allergen" || flag.severity !== "danger") return flag;
  return isCrossContactOnly(flag.evidence) ? { ...flag, severity: "caution" } : flag;
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
 * flags at "caution" with a pharmacist line, apply the diet/allergy severity caps,
 * and keep the verdict consistent.
 */
export function enforceSafetyRules(analysis: Analysis, language: string): Analysis {
  const personalFlags = analysis.personalFlags
    .filter((f) => f.evidence.trim().length > 0)
    .map((f) => clampAllergenCrossContact(clampDiet(clampInteraction(f, language))));
  const labelWarnings = analysis.labelWarnings.filter((w) => w.evidence.trim().length > 0);
  return {
    ...analysis,
    personalFlags,
    labelWarnings,
    safeForYou: guardedVerdict(analysis.safeForYou, personalFlags, analysis.personalFlags.length - personalFlags.length),
    disclaimer:
      analysis.disclaimer ?? (analysis.labelType === "medicine" ? (MEDICINE_DISCLAIMER[language] ?? MEDICINE_DISCLAIMER.en!) : null),
  };
}
