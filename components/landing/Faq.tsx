const QUESTIONS = [
  {
    q: "Is this medical advice?",
    a: "No. Label Lens explains what a label says in plain language. For anything about medicines, especially mixing them, it tells you to confirm with a pharmacist. If something sounds like an emergency, call your local emergency number or poison control.",
  },
  {
    q: "Where does my profile go?",
    a: "Nowhere. Your allergies, medications, diet and language are saved in this browser on your device. There is no account and no database. They are sent along with a photo only so that label can be checked for you.",
  },
  {
    q: "What kinds of labels work?",
    a: "Food packaging, medicine boxes and household products like cleaners. Get the ingredients or warnings in frame and as flat as you can.",
  },
  {
    q: "What if my photo is blurry?",
    a: "It says so and asks you to take it again, instead of guessing at words it can't read.",
  },
  {
    q: "How does it avoid making things up?",
    a: "Every warning has to quote the exact words it came from on the label. The app checks each answer in code before showing it: a warning without a quote is dropped, and an answer that doesn't match the expected format is rejected.",
  },
  {
    q: "Which languages are supported?",
    a: "Explanations come in English or Spanish. Pick yours in your profile.",
  },
  {
    q: "Does it cost anything?",
    a: "No. It's free, with no account and no ads.",
  },
] as const;

/** Native disclosure widgets: keyboard and screen-reader support come for free. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <h2 id="faq-title" className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]">
          Questions, answered.
        </h2>
        <div className="border-t border-ink/15">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-b border-ink/15">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <svg viewBox="0 0 24 24" className="size-6 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="max-w-[62ch] pb-6 text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
