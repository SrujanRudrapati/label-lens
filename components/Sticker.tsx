import type { CSSProperties } from "react";
import { stickerAngle, stickerAriaLabel, type StickerItem } from "@/lib/stickers";
import { Pictogram, TONE_CLASS } from "./Pictogram";

const STAGGER_MS = 80;
const STACK_TOP = 10;

/** Earlier (more severe) stickers sit on top where they overlap. */
function stickerStyle(index: number): CSSProperties {
  return { "--r": `${stickerAngle(index)}deg`, "--delay": `${index * STAGGER_MS}ms`, zIndex: STACK_TOP - index } as CSSProperties;
}

interface StickerProps {
  item: StickerItem;
  index: number;
  open: boolean;
  onOpen: (item: StickerItem, trigger: HTMLElement) => void;
}

export function Sticker({ item, index, open, onOpen }: StickerProps) {
  const style = stickerStyle(index);
  return (
    <li className="sticker sticker-apply" style={style}>
      <button
        type="button"
        aria-label={stickerAriaLabel(item)}
        aria-expanded={open}
        onClick={(e) => onOpen(item, e.currentTarget)}
        className={`flex min-h-12 max-w-[17rem] items-center gap-2 rounded-sticker px-3 py-2 text-left text-sticker leading-tight font-bold shadow-sticker ring-[3px] ring-white aria-expanded:outline-3 aria-expanded:outline-offset-2 aria-expanded:outline-ink ${TONE_CLASS[item.severity]}`}
      >
        <Pictogram severity={item.severity} />
        <span>{item.title}</span>
      </button>
    </li>
  );
}

interface MoreStickerProps {
  count: number;
  index: number;
  onMore: () => void;
}

export function MoreSticker({ count, index, onMore }: MoreStickerProps) {
  const style = stickerStyle(index);
  return (
    <li className="sticker sticker-apply" style={style}>
      <button
        type="button"
        onClick={onMore}
        aria-label={`+${count} more ${count === 1 ? "warning" : "warnings"}. Show the full list`}
        className="flex min-h-12 items-center rounded-sticker bg-white px-3 py-2 leading-tight font-bold text-ink shadow-sticker ring-[3px] ring-white"
      >
        +{count} more
      </button>
    </li>
  );
}

const SKELETON_WIDTHS = ["w-44", "w-36", "w-28"] as const;

/** Grey outlines at the same angles and slots the stickers will land in. */
export function StickerSkeletons() {
  return SKELETON_WIDTHS.map((w, i) => (
    <li
      key={w}
      aria-hidden="true"
      className={`sticker h-12 ${w} rounded-sticker border-2 border-dashed border-ink-soft/40 bg-paper/85`}
      style={{ "--r": `${stickerAngle(i)}deg` } as CSSProperties}
    />
  ));
}
