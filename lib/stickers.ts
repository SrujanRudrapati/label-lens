import type { Analysis } from "./schema";

export type Severity = "danger" | "caution" | "info";

export interface StickerItem {
  id: string;
  severity: Severity;
  title: string;
  /** Short text shown on the sticker itself; the full sentence lives in the evidence sheet. */
  stickerTitle: string;
  explanation: string;
  /** Exact text read from the label. Every sticker leads to one. */
  evidence: string;
  /** Present for personal flags: the profile item this matched. */
  profileMatch: string | null;
  kind: "allergen" | "interaction" | "diet" | "other" | "label";
}

export const MAX_VISIBLE_STICKERS = 3;

const SEVERITY_RANK: Record<Severity, number> = { danger: 0, caution: 1, info: 2 };

// Resting angles in degrees, seeded by position so the skeleton outlines and the applied stickers line up.
const ANGLES = [-3.5, 2.5, -1.5, 3, -4] as const;

export function stickerAngle(index: number): number {
  return ANGLES[index % ANGLES.length] ?? 0;
}

export const SEVERITY_WORD: Record<Severity, string> = {
  danger: "Danger",
  caution: "Caution",
  info: "Note",
};

/** Personal flags first (most severe first), then the label's own warnings. */
export function stickersFrom(analysis: Analysis): StickerItem[] {
  const personal = analysis.personalFlags.map((f, i) => ({
    id: `flag-${i}`,
    severity: f.severity,
    title: f.title,
    stickerTitle: f.stickerTitle,
    explanation: f.explanation,
    evidence: f.evidence,
    profileMatch: f.profileMatch || null,
    kind: f.kind,
  }));
  const label = analysis.labelWarnings.map((w, i) => ({
    id: `label-${i}`,
    severity: w.severity,
    title: w.text,
    stickerTitle: w.stickerTitle,
    explanation: "",
    evidence: w.evidence,
    profileMatch: null,
    kind: "label" as const,
  }));
  const bySeverity = (a: StickerItem, b: StickerItem) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  return [...[...personal].sort(bySeverity), ...[...label].sort(bySeverity)];
}

export function stickerAriaLabel(item: StickerItem): string {
  return `${SEVERITY_WORD[item.severity]}: ${item.title}. Show label text`;
}

const MATCH_PREFIX: Record<StickerItem["kind"], string> = {
  allergen: "Matches your allergy",
  interaction: "Matches your medicine",
  diet: "Matches your diet",
  other: "Matches your profile",
  label: "",
};

export function matchLine(item: StickerItem): string | null {
  return item.profileMatch && item.kind !== "label" ? `${MATCH_PREFIX[item.kind]}: ${item.profileMatch}` : null;
}

/** The one sentence the live region announces when the analysis lands. */
export function announcement(analysis: Analysis): string {
  const n = analysis.personalFlags.filter((f) => f.severity !== "info").length;
  if (n === 0) return "Analysis ready. No personal warnings found.";
  return `Analysis ready, ${n} ${n === 1 ? "warning" : "warnings"} for you.`;
}
