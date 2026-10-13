import type { ReactNode } from "react";
import { Icon } from "./icons";
import { PhoneShot } from "./PhoneFrame";

export const REPO_URL = "https://github.com/SrujanRudrapati/label-lens";
export const VIDEO_URL = "https://youtu.be/STqFvowDtD4";

const LINK = "font-bold underline decoration-rule-strong decoration-2 underline-offset-4 hover:decoration-ink";

export function FreePrivate() {
  return (
    <section aria-labelledby="free-title" className="py-16 lg:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h2 id="free-title" className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[1] tracking-[-0.015em]">
          <span className="inline-block">Free.</span> <span className="inline-block">Private.</span> <span className="inline-block">Open source.</span>
        </h2>
        <div className="flex max-w-[30rem] flex-col gap-4">
          <p className="flex items-start gap-3 text-lead">
            <Icon name="lock" className="mt-1 size-6" />
            <span>No account to make. Your profile lives on this device and is only sent along with a photo, to check that label.</span>
          </p>
          <a href={REPO_URL} className={`${LINK} w-fit pl-9`}>
            Read the code on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Every number here is checked against the repo. Update them when the source changes:
 * - 44 quotes: every `evidence` string in fixtures/*.json, each found word for word on its sample photo (docs/STATUS.md).
 * - 2 models: QUICK_MODEL and ANALYSIS_MODEL in lib/models.ts, called in parallel by lib/useScan.ts.
 * - 67 tests: 56 in `npm test` (Vitest) plus 11 in `npm run e2e` (Playwright).
 */
const STATS = [
  { value: "44 of 44", label: "warning quotes in our saved examples found word for word on the label" },
  { value: "2", label: "Claude models read every photo at the same time: one for the first read, one for the full check" },
  { value: "67", label: "automated tests, from the answer format to the full scan in a browser" },
] as const;

export function Numbers() {
  return (
    <section aria-labelledby="numbers-title" className="py-16 lg:py-24">
      <h2 id="numbers-title" className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]">
        By the numbers
      </h2>
      <dl className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
        {STATS.map((s) => (
          <div key={s.value} className="flex flex-col-reverse justify-end gap-3 border-t-[6px] border-ink pt-5">
            <dt className="max-w-[22rem] text-ink-soft">{s.label}</dt>
            <dd className="font-display text-[clamp(3.25rem,6vw,4.75rem)] leading-none tracking-[-0.02em]">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

interface ClosingCtaProps {
  scanButton: ReactNode;
}

export function ClosingCta({ scanButton }: ClosingCtaProps) {
  return (
    <section aria-labelledby="cta-title" className="py-16 lg:py-24">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
        <div className="flex flex-col items-start gap-8">
          <h2 id="cta-title" className="max-w-[10em] font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[1] tracking-[-0.015em]">
            Your next label, explained in seconds.
          </h2>
          <div className="w-full sm:w-auto">{scanButton}</div>
        </div>
        <PhoneShot
          screen="evidence"
          alt="An opened Contains peanuts warning that quotes the label: CONTAINS: PEANUTS, SOY."
          width={280}
          className="rotate-[3deg]"
        />
      </div>
    </section>
  );
}

interface LandingFooterProps {
  onOpenApp: () => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  return (
    <footer className="mt-8 border-t border-ink/15 pt-10 pb-6">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <span className="text-lead font-bold">Label Lens</span>
          <p className="max-w-[28rem] text-ink-soft">Point your phone at any label and learn what it means for you, with the label&apos;s own words as proof.</p>
        </div>
        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className="font-bold">
            Product
          </h2>
          <ul className="mt-2 flex flex-col">
            <li><a href="#how" className={`${LINK} inline-flex min-h-11 items-center`}>How it works</a></li>
            <li><a href="#proof" className={`${LINK} inline-flex min-h-11 items-center`}>Proof</a></li>
            <li><a href="#faq" className={`${LINK} inline-flex min-h-11 items-center`}>FAQ</a></li>
            <li>
              <button type="button" onClick={onOpenApp} className={`${LINK} inline-flex min-h-11 items-center`}>
                Open the app
              </button>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-project">
          <h2 id="footer-project" className="font-bold">
            Project
          </h2>
          <ul className="mt-2 flex flex-col">
            <li><a href={REPO_URL} className={`${LINK} inline-flex min-h-11 items-center`}>GitHub</a></li>
            <li><a href={VIDEO_URL} className={`${LINK} inline-flex min-h-11 items-center`}>Demo video</a></li>
          </ul>
        </nav>
      </div>
      <p className="mt-10 border-t border-rule pt-5 text-meta text-ink-soft">Label Lens explains labels. It is not medical advice.</p>
    </footer>
  );
}
