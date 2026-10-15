import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export const TONE = {
  yellow: "var(--color-sticker-yellow)",
  blue: "var(--color-sticker-blue)",
  red: "var(--color-sticker-red)",
  green: "var(--color-sticker-green)",
} as const;
export type Tone = keyof typeof TONE;

/** Yellow is light enough to use near full strength; the others are tinted down so ink text stays AA. */
const STRENGTH: Record<Tone, string> = { yellow: "70%", red: "22%", blue: "22%", green: "26%" };

interface MarkProps {
  tone: Tone;
  icon?: IconName;
  children: ReactNode;
}

/** A highlighted phrase, optionally led by a tiny tilted sticker carrying an icon. */
export function Mark({ tone, icon, children }: MarkProps) {
  return (
    <span className="mark" style={{ "--mark": TONE[tone], "--mark-strength": STRENGTH[tone] } as CSSProperties}>
      {icon && (
        <span
          aria-hidden="true"
          className="mr-[0.18em] inline-grid size-[0.8em] -translate-y-[0.06em] rotate-[-6deg] place-items-center rounded-[0.12em] bg-white align-middle text-ink shadow-sticker"
        >
          <Icon name={icon} className="size-[0.6em]" />
        </span>
      )}
      {children}
    </span>
  );
}

interface NumberStickerProps {
  n: number;
  tone: Tone;
  tilt?: number;
}

/** A step number printed on a small tilted sticker. Only used where the content really is a sequence. */
export function NumberSticker({ n, tone, tilt = -4 }: NumberStickerProps) {
  const onDark = tone === "red" || tone === "blue";
  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-10 shrink-0 place-items-center rounded-sticker text-lead font-bold shadow-sticker ring-[3px] ring-white ${onDark ? "text-white" : "text-ink"}`}
      style={{ background: TONE[tone], transform: `rotate(${tilt}deg)` }}
    >
      {n}
    </span>
  );
}
