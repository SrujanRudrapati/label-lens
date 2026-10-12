export type SampleId = "snack" | "snack-es" | "ibuprofen" | "cleaner" | "blurry";
export type StickerTone = "red" | "yellow" | "blue" | "green";

export interface Sample {
  id: SampleId;
  label: string;
  /** Edge color on the chip, echoing the sticker that sample is likely to get. */
  tone: StickerTone;
}

export const SAMPLES: readonly Sample[] = [
  { id: "snack", label: "Snack bar", tone: "red" },
  { id: "ibuprofen", label: "Pain relief", tone: "yellow" },
  { id: "cleaner", label: "Cleaner", tone: "red" },
  { id: "snack-es", label: "Spanish label", tone: "blue" },
  { id: "blurry", label: "Blurry photo", tone: "yellow" },
];

export function sampleSrc(id: SampleId): string {
  return `/samples/${id}.jpg`;
}
