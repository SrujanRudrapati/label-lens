import type { Ref } from "react";
import { matchLine, SEVERITY_WORD, type StickerItem } from "@/lib/stickers";
import { BAR_CLASS, MiniSticker } from "./Pictogram";

interface EvidenceSheetProps {
  item: StickerItem;
  onClose: () => void;
  ref?: Ref<HTMLElement>;
}

/** Opens inline under the title: the exact words from the label behind a sticker. */
export function EvidenceSheet({ item, onClose, ref }: EvidenceSheetProps) {
  const match = matchLine(item);
  return (
    <section
      ref={ref}
      id="evidence"
      tabIndex={-1}
      aria-labelledby="evidence-title"
      className={`border-l-[6px] py-1 pl-4 ${BAR_CLASS[item.severity]}`}
    >
      <h2 id="evidence-title" className="flex items-start gap-3 text-lead font-bold">
        <MiniSticker severity={item.severity} />
        <span>
          <span className="sr-only">{SEVERITY_WORD[item.severity]}: </span>
          {item.title}
        </span>
      </h2>
      <p className="mt-3 text-meta text-ink-soft">The label says</p>
      <blockquote className="mt-1 text-lead">&ldquo;{item.evidence}&rdquo;</blockquote>
      {item.explanation && <p className="mt-3 max-w-[62ch]">{item.explanation}</p>}
      {match && <p className="mt-2 text-ink-soft">{match}</p>}
      <button
        type="button"
        onClick={onClose}
        className="mt-3 min-h-12 rounded-full border border-rule-strong bg-white px-5 font-bold"
      >
        Close
      </button>
    </section>
  );
}
