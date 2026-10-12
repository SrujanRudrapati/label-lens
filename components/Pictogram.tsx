import type { Severity } from "@/lib/stickers";

interface PictogramProps {
  severity: Severity | "safe";
  className?: string;
}

/** Shape carries the meaning as well as color: octagon = danger, triangle = caution, circle = note, check = safe. */
export function Pictogram({ severity, className = "size-6" }: PictogramProps) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      {severity === "danger" && (
        <>
          <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 7v6.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
        </>
      )}
      {severity === "caution" && (
        <>
          <path d="M12 2.8 22.2 20.5H1.8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 9.5v5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="12" cy="17.5" r="1.4" fill="currentColor" />
        </>
      )}
      {severity === "info" && (
        <>
          <circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M12 11v6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="12" cy="7.3" r="1.5" fill="currentColor" />
        </>
      )}
      {severity === "safe" && (
        <>
          <circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export const TONE_CLASS: Record<Severity | "safe", string> = {
  danger: "bg-sticker-red text-white",
  caution: "bg-sticker-yellow text-ink",
  info: "bg-sticker-blue text-white",
  safe: "bg-sticker-green text-ink",
};

export const BAR_CLASS: Record<Severity, string> = {
  danger: "border-sticker-red",
  caution: "border-sticker-yellow",
  info: "border-sticker-blue",
};

/** A tiny sticker used as a list marker, so every colored thing on the page is still a sticker. */
export function MiniSticker({ severity }: { severity: Severity | "safe" }) {
  return (
    <span className={`inline-grid size-8 shrink-0 place-items-center rounded-sticker shadow-sticker ${TONE_CLASS[severity]}`}>
      <Pictogram severity={severity} className="size-5" />
    </span>
  );
}
