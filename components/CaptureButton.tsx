"use client";

import { useRef, type ChangeEvent, type Ref } from "react";

interface CaptureButtonProps {
  onFile: (file: File) => void;
  label: string;
  variant?: "primary" | "pill" | "quiet";
  ref?: Ref<HTMLButtonElement>;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden="true" focusable="false">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.8" r="3.3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Plain file input with capture (no getUserMedia), so it works on iOS Safari and opens the rear camera. */
export function CaptureButton({ onFile, label, variant = "primary", ref }: CaptureButtonProps) {
  const input = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Clear the value so picking the same photo again still fires change.
    e.target.value = "";
    if (file) onFile(file);
  }

  const look = {
    primary: "h-16 w-full justify-center rounded-sheet bg-ink text-lead text-paper",
    pill: "min-h-12 rounded-full bg-ink pr-5 pl-4 text-paper",
    quiet: "min-h-12 rounded-full border border-rule-strong bg-white px-4",
  }[variant];

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      <button ref={ref} type="button" onClick={() => input.current?.click()} className={`flex items-center gap-3 font-bold ${look}`}>
        {variant !== "quiet" && <CameraIcon />}
        {label}
      </button>
    </>
  );
}
