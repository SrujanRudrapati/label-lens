"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { CaptureButton } from "./CaptureButton";
import { SampleChips } from "./SampleChips";
import type { SampleId } from "@/lib/samples";

const TONE = {
  yellow: "var(--color-sticker-yellow)",
  blue: "var(--color-sticker-blue)",
  red: "var(--color-sticker-red)",
  green: "var(--color-sticker-green)",
} as const;

const HEADLINE = "Read the fine print, made for you.";

interface HomeProps {
  header: ReactNode;
  notice: ReactNode;
  footer: ReactNode;
  scanButtonRef: Ref<HTMLButtonElement>;
  onFile: (file: File) => void;
  onSample: (id: SampleId) => void;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const STEPS = [
  {
    text: "Snap a label",
    tone: TONE.yellow,
    icon: (
      <Icon>
        <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
        <circle cx="12" cy="12.8" r="3.2" />
      </Icon>
    ),
  },
  {
    text: "Checks your allergies & meds",
    tone: TONE.red,
    icon: (
      <Icon>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
      </Icon>
    ),
  },
  {
    text: "Shows the proof",
    tone: TONE.blue,
    icon: (
      <Icon>
        <path d="M7 7h4v4c0 3-1.5 4.5-4 5M15 7h4v4c0 3-1.5 4.5-4 5" />
      </Icon>
    ),
  },
] as const;

/** A real sequence, so it reads as an ordered list. Icons sit on small tilted stickers. */
function StepRow() {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-3" aria-label="How it works">
      {STEPS.map((step, i) => (
        <li key={step.text} className="flex items-center gap-3">
          <span className="flex items-center gap-2.5 font-bold">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-sticker text-ink shadow-sticker"
              style={{ background: `color-mix(in srgb, ${step.tone} 30%, white)`, transform: `rotate(${i % 2 ? 3 : -3}deg)` }}
            >
              {step.icon}
            </span>
            {step.text}
          </span>
          {i < STEPS.length - 1 && (
            <svg viewBox="0 0 24 24" className="size-5 text-ink-soft" aria-hidden="true" focusable="false">
              <path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}

/** The real app at phone width, running the snack sample. Mounted on desktop only so phones never load it. */
function PhoneDemo({ live }: { live: boolean }) {
  return (
    <div className="phone relative w-[414px] shrink-0 rounded-[56px] bg-ink p-3 shadow-[0_2px_0_rgba(255,255,255,0.4)_inset,0_40px_80px_-30px_rgba(24,38,58,0.55),0_18px_36px_-18px_rgba(24,38,58,0.4)]">
      <div className="relative h-[800px] w-[390px] overflow-hidden rounded-[44px] bg-paper">
        <span aria-hidden="true" className="absolute top-2.5 left-1/2 z-10 h-[26px] w-[104px] -translate-x-1/2 rounded-full bg-ink" />
        {live && <iframe src="/demo" title="Label Lens, running a sample snack bar label" className="size-full border-0 pt-10" />}
      </div>
    </div>
  );
}


function Swipe({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  return (
    <span className="swipe" style={{ "--swipe": TONE[tone] } as CSSProperties}>
      {children}
    </span>
  );
}

/** Highlights follow sticker meaning loosely: caution for food, info for medicine, danger for cleaners, safe for languages. */
function ReadsStrip() {
  return (
    <p className="max-w-[24em] font-display text-[clamp(2.25rem,3.4vw,3.25rem)] leading-[1.2] tracking-[-0.005em]">
      Reads <Swipe tone="yellow">food labels</Swipe>, <Swipe tone="blue">medicine boxes</Swipe> and <Swipe tone="red">cleaning products</Swipe>, in{" "}
      <Swipe tone="green">English</Swipe> and <Swipe tone="green">Spanish</Swipe>.
    </p>
  );
}

export function Home({ header, notice, footer, scanButtonRef, onFile, onSample }: HomeProps) {
  const desktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <main className="sky mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-7 pb-5 lg:max-w-[1200px] lg:gap-0">
      {header}
      {notice}

      <div className="flex flex-1 flex-col gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-6">
        <section className="flex flex-col gap-4 lg:gap-8">
          <p className="hidden w-fit items-center gap-2 rounded-full border border-rule bg-white/80 py-1.5 pr-4 pl-2 text-meta font-bold lg:flex">
            <span aria-hidden="true" className="size-3 rotate-[-6deg] rounded-[3px] bg-sticker-red" />
            Every warning quotes the label
          </p>
          <h1 className="font-display text-balance text-[clamp(2.75rem,12vw,3.5rem)] leading-[1.02] font-normal tracking-[-0.015em] lg:max-w-[9.5em] lg:text-[clamp(4rem,5.6vw,5rem)]">
            {HEADLINE}
          </h1>
          <p className="max-w-[62ch] text-lead text-ink-soft lg:hidden">Point at a label. We&apos;ll explain what it means for you.</p>
          <div className="hidden lg:block">
            <StepRow />
          </div>
          <div className="hidden flex-wrap items-center gap-x-6 gap-y-3 lg:flex">
            <CaptureButton ref={desktop ? scanButtonRef : undefined} onFile={onFile} label="Scan a label" variant="hero" />
            <button type="button" onClick={() => onSample("snack")} className="min-h-12 rounded-full px-2 font-bold underline decoration-rule-strong decoration-2 underline-offset-4">
              or try a sample
            </button>
          </div>
          <p className="hidden items-center gap-2 text-meta text-ink-soft lg:flex">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
              <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            </svg>
            No account. Your profile stays on this device.
          </p>
        </section>

        <div className="hidden lg:block">
          <PhoneDemo live={desktop} />
        </div>

        {/* Phones: camera first. */}
        <div className="min-h-4 flex-1 lg:hidden" />
        <div className="flex flex-col gap-7 lg:hidden">
          <CaptureButton ref={desktop ? undefined : scanButtonRef} onFile={onFile} label="Scan a label" variant="hero" />
          <SampleChips onPick={onSample} />
        </div>
      </div>

      <div className="hidden border-t border-ink/10 py-14 lg:block">
        <ReadsStrip />
      </div>
      {footer}
    </main>
  );
}
