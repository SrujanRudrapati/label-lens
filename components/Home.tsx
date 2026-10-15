"use client";

import type { ReactNode, RefObject } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import type { SampleId } from "@/lib/samples";
import { CaptureButton } from "./CaptureButton";
import { SampleChips } from "./SampleChips";
import { ClosingCta, FreePrivate, LandingFooter, Numbers } from "./landing/Closing";
import { Faq } from "./landing/Faq";
import { HowItWorks } from "./landing/HowItWorks";
import { Icon, type IconName } from "./landing/icons";
import { TONE, type Tone } from "./landing/Mark";
import { Nav } from "./landing/Nav";
import { PhoneFrame } from "./landing/PhoneFrame";
import { Proof } from "./landing/Proof";
import { ReadsStrip } from "./landing/ReadsStrip";

const HEADLINE = "Read the fine print, made for you.";

interface HomeProps {
  /** Full landing page (the site's home), or just the scan screen (inside the demo phone). */
  landing: boolean;
  profileLink: ReactNode;
  notice: ReactNode;
  footer: ReactNode;
  scanButtonRef: RefObject<HTMLButtonElement | null>;
  onFile: (file: File) => void;
  /** Asked before the file picker opens; false means the app showed something else first. */
  allowCamera: () => boolean;
  onSample: (id: SampleId) => void;
}

const STEPS: readonly { text: string; tone: Tone; icon: IconName }[] = [
  { text: "Snap a label", tone: "yellow", icon: "camera" },
  { text: "Checks your allergies & meds", tone: "red", icon: "person" },
  { text: "Shows the proof", tone: "blue", icon: "quote" },
];

/** A real sequence, so it reads as an ordered list. Icons sit on small tilted stickers. */
function StepRow() {
  return (
    <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-3 text-[0.95rem]" aria-label="How it works, in short">
      {STEPS.map((step, i) => (
        <li key={step.text} className="flex items-center gap-2.5">
          <span className="flex items-center gap-2 font-bold whitespace-nowrap">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-sticker text-ink shadow-sticker"
              style={{ background: `color-mix(in srgb, ${TONE[step.tone]} 30%, white)`, transform: `rotate(${i % 2 ? 3 : -3}deg)` }}
            >
              <Icon name={step.icon} />
            </span>
            {step.text}
          </span>
          {i < STEPS.length - 1 && <Icon name="arrow" className="size-4 text-ink-soft" />}
        </li>
      ))}
    </ol>
  );
}

/** The real app at phone width, running the snack sample. Mounted on desktop only so phones never load it. */
function PhoneDemo({ live }: { live: boolean }) {
  return (
    <div className="phone">
      <PhoneFrame width={390} aspect="390 / 800">
        {live && <iframe src="/demo" title="Label Lens, running a sample snack bar label" className="size-full border-0 pt-10" />}
      </PhoneFrame>
    </div>
  );
}

interface HeroProps {
  desktop: boolean;
  scanButtonRef: RefObject<HTMLButtonElement | null>;
  onFile: (file: File) => void;
  /** Asked before the file picker opens; false means the app showed something else first. */
  allowCamera: () => boolean;
  onSample: (id: SampleId) => void;
}

function Hero({ desktop, scanButtonRef, onFile, allowCamera, onSample }: HeroProps) {
  return (
    <div className="flex min-h-[calc(100svh-5.5rem)] flex-col gap-7 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:py-10">
      <section aria-labelledby="hero-title" className="flex flex-col gap-4 pt-2 lg:gap-8 lg:pt-0">
        <p className="hidden w-fit items-center gap-2 rounded-full border border-rule bg-white/80 py-1.5 pr-4 pl-2 text-meta font-bold lg:flex">
          <span aria-hidden="true" className="size-3 rotate-[-6deg] rounded-[3px] bg-sticker-red" />
          Every warning quotes the label
        </p>
        <h1 id="hero-title" className="font-display text-balance text-[2.75rem] leading-[1.02] font-normal tracking-[-0.015em] lg:max-w-[9.5em] lg:text-[clamp(4rem,5.6vw,5rem)] lg:leading-[0.98]">
          {HEADLINE}
        </h1>
        <p className="max-w-[62ch] text-lead text-ink-soft lg:hidden">Point at a label. We&apos;ll explain what it means for you.</p>
        <div className="hidden lg:block">
          <StepRow />
        </div>
        <div className="hidden flex-col items-start gap-3 lg:flex">
          <CaptureButton ref={desktop ? scanButtonRef : undefined} onFile={onFile} allowCamera={allowCamera} label="Scan a label" variant="hero" />
          <button
            type="button"
            onClick={() => onSample("snack")}
            className="min-h-12 rounded-full px-2 font-bold underline decoration-rule-strong decoration-2 underline-offset-4 hover:decoration-ink"
          >
            or try a sample
          </button>
        </div>
        <p className="hidden items-center gap-2 text-meta text-ink-soft lg:flex">
          <Icon name="lock" className="size-4" />
          Free · No account · Your profile stays on this device
        </p>
      </section>

      <div className="hidden lg:block">
        <PhoneDemo live={desktop} />
      </div>

      {/* Phones: camera first, the scan button within thumb reach. */}
      <div className="min-h-4 flex-1 lg:hidden" />
      <div className="flex flex-col gap-7 pb-4 lg:hidden">
        <CaptureButton ref={desktop ? undefined : scanButtonRef} onFile={onFile} allowCamera={allowCamera} label="Scan a label" variant="hero" />
        <SampleChips onPick={onSample} />
      </div>
    </div>
  );
}

const DIVIDER = "border-t border-ink/10";

export function Home({ landing, profileLink, notice, footer, scanButtonRef, onFile, allowCamera, onSample }: HomeProps) {
  const desktop = useMediaQuery(DESKTOP_QUERY);

  function openApp() {
    const button = scanButtonRef.current;
    if (!button) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    button.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
    button.focus({ preventScroll: true });
  }

  if (!landing) {
    return (
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-7 pb-5">
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-x-4">
          <span className="text-lead font-bold">Label Lens</span>
          {profileLink}
        </header>
        {notice}
        <Hero desktop={desktop} scanButtonRef={scanButtonRef} onFile={onFile} allowCamera={allowCamera} onSample={onSample} />
        {footer}
      </main>
    );
  }

  return (
    <>
      <Nav profile={profileLink} onOpenApp={openApp} />
      <main id="top" className="sky mx-auto flex w-full max-w-[560px] flex-1 flex-col lg:max-w-[1120px]">
        {notice && <div className="pt-4">{notice}</div>}
        <Hero desktop={desktop} scanButtonRef={scanButtonRef} onFile={onFile} allowCamera={allowCamera} onSample={onSample} />
        <div className={DIVIDER}>
          <ReadsStrip />
        </div>
        <HowItWorks />
        <div className={DIVIDER}>
          <Proof />
        </div>
        <div className={DIVIDER}>
          <FreePrivate />
        </div>
        <Numbers />
        <div className={DIVIDER}>
          <Faq />
        </div>
        <ClosingCta scanButton={<CaptureButton onFile={onFile} allowCamera={allowCamera} label="Scan a label" variant="hero" />} />
        <LandingFooter onOpenApp={openApp} />
      </main>
    </>
  );
}
