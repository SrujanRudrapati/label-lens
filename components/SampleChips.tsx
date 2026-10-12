import Image from "next/image";
import { SAMPLES, sampleSrc, type SampleId, type StickerTone } from "@/lib/samples";

const EDGE: Record<StickerTone, string> = {
  red: "border-l-sticker-red",
  yellow: "border-l-sticker-yellow",
  blue: "border-l-sticker-blue",
  green: "border-l-sticker-green",
};

interface SampleChipsProps {
  onPick: (id: SampleId) => void;
}

/** Each sample is a small paper label with a sticker-colored edge. */
export function SampleChips({ onPick }: SampleChipsProps) {
  return (
    <section aria-labelledby="samples-heading" className="flex flex-col gap-3">
      <h2 id="samples-heading" className="text-ink-soft">
        Or try one of ours
      </h2>
      <ul className="grid grid-cols-2 gap-2.5">
        {SAMPLES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s.id)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-[10px] border border-l-[6px] border-rule bg-white py-2 pr-3 pl-2 text-left font-bold ${EDGE[s.tone]}`}
            >
              <Image src={sampleSrc(s.id)} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[4px] object-cover" />
              <span className="leading-tight">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
