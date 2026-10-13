import { NumberSticker, type Tone } from "./Mark";
import { PhoneShot, type ScreenId } from "./PhoneFrame";

interface Step {
  title: string;
  line: string;
  screen: ScreenId;
  alt: string;
  tone: Tone;
}

const STEPS: readonly Step[] = [
  {
    title: "Tell it about you",
    line: "Allergies, medications, diet and language. It stays on your phone.",
    screen: "profile",
    alt: "The profile screen, listing a peanut and tree nut allergy, warfarin, and a vegan diet.",
    tone: "yellow",
  },
  {
    title: "Snap any label",
    line: "Food, medicine or household products.",
    screen: "home",
    alt: "The Label Lens home screen with a large Scan a label button and sample labels to try.",
    tone: "blue",
  },
  {
    title: "Instant first read",
    line: "The product name appears first, while the full check is still running.",
    screen: "first-read",
    alt: "A snack bar photo already named Trailhead Crunch Honey Peanut Bar, with the check against the profile still in progress.",
    tone: "green",
  },
  {
    title: "Warnings made for you",
    line: "Color stickers for your allergies and medicines.",
    screen: "result",
    alt: "The snack bar photo with a red Contains peanuts sticker and other warnings stuck on it.",
    tone: "red",
  },
  {
    title: "Tap for proof",
    line: "Every sticker shows the exact words from the label.",
    screen: "evidence",
    alt: "An opened Contains peanuts warning that quotes the label: CONTAINS: PEANUTS, SOY.",
    tone: "yellow",
  },
  {
    title: "Listen or ask",
    line: "Hear it read aloud, or ask a follow-up question.",
    screen: "ask",
    alt: "A follow-up question about the label with its answer written underneath.",
    tone: "blue",
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="py-16 lg:py-24">
      <h2 id="how-title" className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]">
        How it works
      </h2>
      <p className="mt-3 text-lead text-ink-soft">No sign-up. Just point your camera.</p>
      <ol className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col items-center gap-6 lg:items-start">
            <PhoneShot screen={step.screen} alt={step.alt} width={260} />
            <div className="flex max-w-[22rem] items-start gap-4">
              <NumberSticker n={i + 1} tone={step.tone} tilt={i % 2 ? 4 : -4} />
              <div>
                <h3 className="text-lead leading-tight font-bold">{step.title}</h3>
                <p className="mt-1 text-ink-soft">{step.line}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
