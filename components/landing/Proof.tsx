import type { ReactNode } from "react";
import { Pictogram } from "../Pictogram";
import { Icon } from "./icons";

interface NoteProps {
  good: boolean;
  children: ReactNode;
}

/** A margin note on the comparison: a cross for what's wrong, a check for what's right. */
function Note({ good, children }: NoteProps) {
  return (
    <li className="flex items-center gap-2.5 font-bold">
      <span
        aria-hidden="true"
        className={`grid size-7 shrink-0 place-items-center rounded-full ${good ? "bg-sticker-green/25 text-ink" : "bg-sticker-red/20 text-ink"}`}
      >
        <Icon name={good ? "check" : "cross"} className="size-4" />
      </span>
      <span>
        <span className="sr-only">{good ? "Good: " : "Problem: "}</span>
        {children}
      </span>
    </li>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return <h3 className="text-meta font-bold text-ink-soft">{children}</h3>;
}

function TypicalAnswer() {
  return (
    <article className="flex flex-col gap-5">
      <CardLabel>A typical AI answer (illustrative)</CardLabel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start lg:flex-col lg:items-stretch">
        <p className="flex-1 rounded-[22px] rounded-bl-[6px] border border-rule bg-white px-6 py-5 text-lead shadow-[0_18px_40px_-28px_rgba(24,38,58,0.45)]">
          <span className="decoration-sticker-red decoration-wavy decoration-2 underline-offset-[5px] [text-decoration-line:underline]">Good news!</span> This bar is{" "}
          <span className="decoration-sticker-red decoration-wavy decoration-2 underline-offset-[5px] [text-decoration-line:underline]">vegan and safe for most people</span>. Enjoy!
        </p>
        <ul className="flex flex-col gap-3 sm:w-52 sm:shrink-0 sm:pt-3 lg:w-auto lg:flex-row lg:flex-wrap lg:gap-x-6 lg:pt-0">
          <Note good={false}>No source</Note>
          <Note good={false}>Claims it can&apos;t know</Note>
          <Note good={false}>Ignores your allergy</Note>
        </ul>
      </div>
    </article>
  );
}

function LabelLensAnswer() {
  return (
    <article className="flex flex-col gap-5">
      <CardLabel>Label Lens</CardLabel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start lg:flex-col lg:items-stretch">
        <div className="flex-1 rounded-sheet border border-rule bg-white px-6 pt-6 pb-5 shadow-[0_18px_40px_-28px_rgba(24,38,58,0.45)]">
          <p className="inline-flex rotate-[-2deg] items-center whitespace-nowrap gap-2 rounded-sticker bg-sticker-red px-3 py-2 text-sticker leading-tight font-bold text-white shadow-sticker ring-[3px] ring-white">
            <Pictogram severity="danger" />
            Contains peanuts
          </p>
          <div className="mt-5 border-l-[6px] border-sticker-red pl-4">
            <p className="text-meta text-ink-soft">The label says</p>
            <blockquote className="mt-1 text-lead">&ldquo;CONTAINS: PEANUTS, SOY.&rdquo;</blockquote>
            <p className="mt-2 text-ink-soft">Matches your allergy: peanut</p>
          </div>
        </div>
        <ul className="flex flex-col gap-3 sm:w-52 sm:shrink-0 sm:pt-3 lg:w-auto lg:flex-row lg:flex-wrap lg:gap-x-6 lg:pt-0">
          <Note good>Quotes the label</Note>
          <Note good>Matched to your allergy</Note>
          <Note good>Severity fits the risk</Note>
        </ul>
      </div>
    </article>
  );
}

const PROMISES = [
  "Every warning quotes the label.",
  "It never says “vegan” or “allergen-free” unless the label does.",
  "Medicine questions always point you to a pharmacist.",
] as const;

export function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="py-16 lg:py-24">
      <h2 id="proof-title" className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]">
        Proof, not guesses
      </h2>
      <p className="mt-3 max-w-[40rem] text-lead text-ink-soft">The same peanut snack bar, for someone with a peanut allergy.</p>
      <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-12">
        <TypicalAnswer />
        <LabelLensAnswer />
      </div>
      <ul className="mt-14 grid gap-4 border-t border-ink/10 pt-8 md:grid-cols-3 md:gap-8">
        {PROMISES.map((p) => (
          <li key={p} className="flex items-start gap-3 text-lead leading-snug font-bold">
            <span aria-hidden="true" className="mt-1 size-3.5 shrink-0 rotate-[-6deg] rounded-[3px] bg-sticker-green" />
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
