"use client";

import { useEffect, useRef, useState } from "react";
import { profileItems, useProfile } from "@/lib/profile";
import type { Profile } from "@/lib/schema";
import { scanProblem, scanStatus, scanTitle } from "@/lib/scanState";
import { announcement, stickersFrom, type StickerItem } from "@/lib/stickers";
import { buildSpeech, useSpeech } from "@/lib/speak";
import { useScan } from "@/lib/useScan";
import { CaptureButton } from "./CaptureButton";
import { ERROR_COPY, ErrorState } from "./ErrorState";
import { EvidenceSheet } from "./EvidenceSheet";
import { PhotoStage } from "./PhotoStage";
import { ProfileSetup } from "./ProfileSetup";
import { ProfileSheet } from "./ProfileSheet";
import { PendingBody, ResultBody } from "./ResultBody";
import { SampleChips } from "./SampleChips";

const LABEL_TYPE_NAME = { food: "Food label", medicine: "Medicine label", household: "Household product", other: "Label" } as const;

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Footer() {
  return <footer className="mt-4 border-t border-rule pt-5 text-meta text-ink-soft">Label Lens explains labels. It is not medical advice.</footer>;
}

export function LabelLens() {
  const { profile, ready, setupDone, save, skipSetup } = useProfile();
  const { state, scan, retry, reset } = useScan(profile);
  const speech = useSpeech();
  const [profileOpen, setProfileOpen] = useState(false);
  const status = scanStatus(state);
  const [open, setOpen] = useState<StickerItem | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const scanButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLHeadingElement>(null);
  const openTrigger = useRef<HTMLElement | null>(null);
  const wasIdle = useRef(true);

  // Move focus with the view so keyboard and screen-reader users land on the new screen.
  useEffect(() => {
    const idle = status === "idle";
    if (idle && !wasIdle.current) scanButtonRef.current?.focus();
    wasIdle.current = idle;
  }, [status]);

  // Every new scan (including a retake straight from a result) lands on the result heading.
  useEffect(() => {
    if (state.active) headingRef.current?.focus();
  }, [state.run, state.active]);

  useEffect(() => {
    if (open) sheetRef.current?.focus();
  }, [open]);

  function startFile(file: File) {
    setOpen(null);
    speech.stop();
    scan({ kind: "file", file });
  }

  function goHome() {
    setOpen(null);
    speech.stop();
    reset();
  }

  function openEvidence(item: StickerItem, trigger: HTMLElement) {
    if (open?.id === item.id) return closeEvidence();
    openTrigger.current = trigger;
    setOpen(item);
  }

  function closeEvidence() {
    setOpen(null);
    openTrigger.current?.focus();
  }

  function saveFromSheet(next: Profile) {
    save(next);
    setProfileOpen(false);
  }

  if (status === "idle" && ready && !setupDone) {
    return (
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-6 pb-5">
        <header className="flex min-h-12 items-center">
          <span className="text-lead font-bold">Label Lens</span>
        </header>
        <ProfileSetup initial={profile} onSave={save} onSkip={skipSetup} />
        <Footer />
      </main>
    );
  }

  if (status === "idle") {
    return (
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-7 pb-5">
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-x-4">
          <span className="text-lead font-bold">Label Lens</span>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="-mr-3 flex min-h-12 items-center rounded-full px-3 text-meta font-bold text-ink-soft underline decoration-rule-strong decoration-2 underline-offset-4"
          >
            {profileItems(profile).length > 0 ? `Checking for ${profileItems(profile).join(", ")}` : "Add your profile"}
          </button>
        </header>

        <section className="flex flex-col gap-3">
          <h1 className="text-title leading-tight font-bold tracking-[-0.01em]">Point at a label.</h1>
          <p className="max-w-[62ch] text-lead text-ink-soft">We&apos;ll explain what it means for you.</p>
        </section>

        <div className="min-h-4 flex-1 lg:max-h-8" />

        <CaptureButton ref={scanButtonRef} onFile={startFile} label="Scan a label" />
        <SampleChips onPick={(sampleId) => scan({ kind: "sample", sampleId })} />
        <Footer />
        <ProfileSheet open={profileOpen} profile={profile} onSave={saveFromSheet} onClose={() => setProfileOpen(false)} />
      </main>
    );
  }

  const analysis = status === "done" ? state.analysis : null;
  const stickers = analysis ? stickersFrom(analysis) : null;
  const pending = status === "reading" || status === "quick-ready";
  const problem = scanProblem(state);
  // A name read off an unreadable photo is a guess, so the problem itself becomes the heading.
  const problemTitle = problem && (status === "unreadable" || !scanTitle(state)) ? ERROR_COPY[problem].title : null;
  const title = problemTitle ?? scanTitle(state);

  return (
    <main className="mx-auto grid w-full max-w-[560px] flex-1 content-start gap-x-14 gap-y-5 pb-5 lg:max-w-[1200px] lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)]">
      <nav aria-label="Scan" className="flex items-center justify-between gap-3 lg:col-span-2">
        <button type="button" onClick={goHome} className="-ml-2 flex min-h-12 items-center gap-1 rounded-full px-2 font-bold">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" focusable="false">
            <path d="m14.5 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          {analysis && speech.supported && (
            <button
              type="button"
              onClick={() => speech.toggle(buildSpeech(analysis), state.language)}
              aria-pressed={speech.speaking}
              className="flex min-h-12 items-center gap-2 rounded-full bg-ink pr-4 pl-3 font-bold whitespace-nowrap text-paper"
            >
              <SpeakerIcon />
              {speech.speaking ? "Stop" : "Read aloud"}
            </button>
          )}
          <CaptureButton onFile={startFile} label="Retake" variant="quiet" />
        </div>
      </nav>

      <div className="lg:sticky lg:top-5 lg:self-start">
        <PhotoStage
          photoUrl={state.photoUrl}
          aspect={state.photoAspect}
          stickers={stickers}
          pending={pending}
          stopped={problem !== null}
          openId={open?.id ?? null}
          onOpen={openEvidence}
          onMore={() => listRef.current?.focus()}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 ref={headingRef} tabIndex={-1} className="text-section leading-tight font-bold">
            {title ?? (
              <>
                <span className="sr-only">Reading the label</span>
                <span aria-hidden="true" className="block h-[1.2em] w-3/4 rounded-full bg-rule" />
              </>
            )}
          </h1>
          <p className="flex min-h-[1.5em] flex-wrap items-center gap-x-3 text-meta text-ink-soft">
            {state.quick && !problemTitle && LABEL_TYPE_NAME[state.quick.labelType]}
            {state.saved && state.quick && !problemTitle && <span className="sr-only">, </span>}
            {state.saved && <span className="rounded-full border border-rule px-2 py-0.5">Saved example</span>}
          </p>
        </div>

        {open && <EvidenceSheet ref={sheetRef} item={open} onClose={closeEvidence} />}

        <p className="sr-only" aria-live="polite">
          {analysis ? announcement(analysis) : ""}
        </p>

        {problem && <ErrorState kind={problem} onRetake={startFile} onRetry={retry} onHome={goHome} titleInHeading={problemTitle !== null} />}
        {pending && <PendingBody quickReady={status === "quick-ready"} />}
        {analysis && stickers && (
          <ResultBody analysis={analysis} profile={profile} stickers={stickers} openId={open?.id ?? null} onOpen={openEvidence} listRef={listRef} language={state.language} />
        )}
      </div>
      <div className="lg:col-span-2">
        <Footer />
      </div>
    </main>
  );
}
