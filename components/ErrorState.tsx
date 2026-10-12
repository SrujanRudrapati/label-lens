import type { FailureKind } from "@/lib/scanApi";
import { CaptureButton } from "./CaptureButton";

type NextStep = "retake" | "retry" | "samples";

export const ERROR_COPY: Record<FailureKind, { title: string; body: string; next: NextStep }> = {
  unreadable: {
    title: "This photo is hard to read",
    body: "Hold the phone steady, add more light, and fill the frame with the label's text. Then take it again.",
    next: "retake",
  },
  bad_photo: {
    title: "That photo couldn't be opened",
    body: "The file may be damaged or in a format this browser can't read. Take a new photo instead.",
    next: "retake",
  },
  network: {
    title: "The connection dropped",
    body: "Your photo didn't reach Label Lens. Check that you're online, then try again.",
    next: "retry",
  },
  rate_limited: {
    title: "Too many scans in a row",
    body: "Wait about 10 seconds, then try again.",
    next: "retry",
  },
  server: {
    title: "Label Lens couldn't finish reading this",
    body: "Something went wrong on our side. Try again. If it keeps happening, try one of the saved examples.",
    next: "retry",
  },
  no_key: {
    title: "Live reading is off in this copy",
    body: "It runs without an API key, so only the saved examples work. Pick one to see how it works.",
    next: "samples",
  },
};

interface ErrorStateProps {
  kind: FailureKind;
  onRetake: (file: File) => void;
  onRetry: () => void;
  onHome: () => void;
  /** The page h1 already shows the title; keep it in the alert for screen readers only. */
  titleInHeading?: boolean;
}

export function ErrorState({ kind, onRetake, onRetry, onHome, titleInHeading = false }: ErrorStateProps) {
  const copy = ERROR_COPY[kind];
  return (
    <div role="alert" className="flex flex-col gap-3 border-l-[6px] border-ink py-1 pl-4">
      {titleInHeading ? <p className="sr-only">{copy.title}</p> : <h2 className="text-lead font-bold">{copy.title}</h2>}
      <p className="max-w-[62ch]">{copy.body}</p>
      <div className="mt-1 flex flex-wrap gap-2.5">
        {copy.next === "retake" && <CaptureButton onFile={onRetake} label="Retake photo" variant="pill" />}
        {copy.next === "retry" && (
          <button type="button" onClick={onRetry} className="min-h-12 rounded-full bg-ink px-5 font-bold text-paper">
            Try again
          </button>
        )}
        <button type="button" onClick={onHome} className="min-h-12 rounded-full border border-rule-strong bg-white px-5 font-bold">
          {copy.next === "samples" ? "See the examples" : "Back to start"}
        </button>
      </div>
    </div>
  );
}
