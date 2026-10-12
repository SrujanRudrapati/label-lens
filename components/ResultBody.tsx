import type { Ref } from "react";
import type { Analysis, Profile } from "@/lib/schema";
import { SEVERITY_WORD, type StickerItem } from "@/lib/stickers";
import { profileItems } from "@/lib/profile";
import { MiniSticker, Pictogram } from "./Pictogram";

type VerdictTone = "danger" | "caution" | "info" | "safe";

function verdictFor(analysis: Analysis, profile: Profile): { tone: VerdictTone; text: string } {
  if (profileItems(profile).length === 0) return { tone: "info", text: "Not checked against a profile yet" };
  switch (analysis.safeForYou) {
    case "no":
      return { tone: "danger", text: "Not safe for you" };
    case "check":
      return { tone: "caution", text: "Check before using" };
    case "yes":
      return { tone: "safe", text: "No warnings for your profile" };
    case "unknown":
      return { tone: "caution", text: "Couldn't fully check this one" };
  }
}

const DEFAULT_DISCLAIMER = "Label Lens explains what the label says. It is not medical advice. Ask a pharmacist if you are unsure.";

interface ItemListProps {
  id: string;
  heading: string;
  items: StickerItem[];
  openId: string | null;
  onOpen: (item: StickerItem, trigger: HTMLElement) => void;
  headingRef?: Ref<HTMLHeadingElement>;
}

function ItemList({ id, heading, items, openId, onOpen, headingRef }: ItemListProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} ref={headingRef} tabIndex={-1} className="text-section font-bold">
        {heading}
      </h2>
      <ul className="flex flex-col divide-y divide-rule border-y border-rule">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3">
            <MiniSticker severity={item.severity} />
            <div className="flex min-w-0 flex-col items-start">
              <p className="font-bold">
                <span className="sr-only">{SEVERITY_WORD[item.severity]}: </span>
                {item.title}
              </p>
              {item.explanation && <p className="max-w-[62ch] text-ink-soft">{item.explanation}</p>}
              <button
                type="button"
                aria-expanded={openId === item.id}
                aria-label={`Show label text for ${item.title}`}
                onClick={(e) => onOpen(item, e.currentTarget)}
                className="-ml-1 min-h-12 px-1 font-bold underline decoration-ink-soft/60 decoration-2 underline-offset-4"
              >
                Show label text
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ResultBodyProps {
  analysis: Analysis;
  profile: Profile;
  stickers: StickerItem[];
  openId: string | null;
  onOpen: (item: StickerItem, trigger: HTMLElement) => void;
  listRef: Ref<HTMLHeadingElement>;
}

export function ResultBody({ analysis, profile, stickers, openId, onOpen, listRef }: ResultBodyProps) {
  const verdict = verdictFor(analysis, profile);
  const personal = stickers.filter((s) => s.kind !== "label");
  const label = stickers.filter((s) => s.kind === "label");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="flex min-h-9 items-center gap-3 text-lead font-bold">
          <MiniSticker severity={verdict.tone} />
          {verdict.text}
        </p>
        <p className="max-w-[62ch]">{analysis.summary}</p>
      </div>

      <ItemList id="for-you" heading="For you" items={personal} openId={openId} onOpen={onOpen} headingRef={listRef} />
      <ItemList
        id="on-label"
        heading="On the label"
        items={label}
        openId={openId}
        onOpen={onOpen}
        headingRef={personal.length === 0 ? listRef : undefined}
      />

      {analysis.keyFacts.length > 0 && (
        <section aria-labelledby="key-facts" className="flex flex-col gap-3">
          <h2 id="key-facts" className="text-section font-bold">
            Key facts
          </h2>
          <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 border-t border-rule [font-variant-numeric:tabular-nums]">
            {analysis.keyFacts.map((f) => (
              <div key={f.label} className="col-span-2 grid grid-cols-subgrid border-b border-rule py-2.5">
                <dt className="text-ink-soft">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="flex max-w-[62ch] gap-2 text-meta text-ink-soft">
        <Pictogram severity="info" className="mt-0.5 size-4" />
        {analysis.disclaimer ?? DEFAULT_DISCLAIMER}
      </p>
    </div>
  );
}

interface PendingBodyProps {
  quickReady: boolean;
}

/** Holds the verdict and summary slots while the analysis is on its way. */
export function PendingBody({ quickReady }: PendingBodyProps) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <p className="flex min-h-9 items-center gap-3 text-ink-soft">
        <span className="size-8 shrink-0 rounded-sticker border-2 border-dashed border-ink-soft/40" />
        {quickReady ? "Checking against your profile…" : "Reading the label…"}
      </p>
      <div className="flex flex-col gap-2.5 pt-1">
        {["w-full", "w-full", "w-11/12", "w-2/3"].map((w, i) => (
          <span key={i} className={`h-4 rounded-full bg-rule ${w}`} />
        ))}
      </div>
    </div>
  );
}
