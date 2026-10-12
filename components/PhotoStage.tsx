import { MAX_VISIBLE_STICKERS, type StickerItem } from "@/lib/stickers";
import { MoreSticker, Sticker, StickerSkeletons } from "./Sticker";

const MIN_ASPECT = 3 / 4;
const MAX_ASPECT = 4 / 3;
const DEFAULT_ASPECT = 1;

interface PhotoStageProps {
  photoUrl: string | null;
  aspect: number | null;
  /** null while the analysis is on its way; skeleton outlines hold the sticker slots. */
  stickers: StickerItem[] | null;
  /** False once the scan has stopped (unreadable or error), so no skeletons linger. */
  pending: boolean;
  /** The scan stopped with a problem: no stickers will come, so drop the space held for them. */
  stopped: boolean;
  openId: string | null;
  onOpen: (item: StickerItem, trigger: HTMLElement) => void;
  onMore: () => void;
}

/** The photo with its sticker layer. The layer is absolutely placed, so stickers landing never move the page. */
export function PhotoStage({ photoUrl, aspect, stickers, pending, stopped, openId, onOpen, onMore }: PhotoStageProps) {
  const ratio = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect ?? DEFAULT_ASPECT));
  const visible = stickers?.slice(0, MAX_VISIBLE_STICKERS) ?? [];
  const hidden = (stickers?.length ?? 0) - visible.length;

  return (
    <div className={`relative ${stopped ? "" : "pb-14"}`}>
      <div
        className="grid max-h-[55vh] w-full place-items-center overflow-hidden rounded-sheet bg-[#E9EDF2] lg:max-h-[78vh]"
        style={{ aspectRatio: ratio }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob URL; next/image can't optimize it
          <img src={photoUrl} alt="Your photo of the label" className="size-full object-contain" />
        ) : (
          <span className="sr-only">Preparing your photo</span>
        )}
      </div>

      {(stickers === null ? pending : stickers.length > 0) && (
        <ul
          aria-label={stickers ? "Warning stickers on your photo" : undefined}
          className="absolute inset-x-3 bottom-0 flex flex-col items-start gap-2.5"
        >
          {stickers === null ? (
            <StickerSkeletons />
          ) : (
            <>
              {visible.map((item, i) => (
                <Sticker key={item.id} item={item} index={i} open={openId === item.id} onOpen={onOpen} />
              ))}
              {hidden > 0 && <MoreSticker count={hidden} index={visible.length} onMore={onMore} />}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
