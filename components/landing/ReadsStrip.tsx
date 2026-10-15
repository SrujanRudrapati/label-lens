import { Mark } from "./Mark";

/** One sentence that names everything Label Lens reads and checks. Tones follow sticker meaning loosely. */
export function ReadsStrip() {
  return (
    <section aria-label="What Label Lens reads" className="py-16 lg:py-20">
      <p className="mx-auto max-w-[22em] text-center font-display text-[clamp(1.9rem,4.2vw,3.25rem)] leading-[1.32] tracking-[-0.005em] text-balance">
        Label Lens reads{" "}
        <Mark tone="yellow" icon="food">
          food labels
        </Mark>
        ,{" "}
        <Mark tone="blue" icon="medicine">
          medicine boxes
        </Mark>{" "}
        and{" "}
        <Mark tone="red" icon="spray">
          cleaning products
        </Mark>
        , in{" "}
        <Mark tone="green" icon="language">
          English
        </Mark>{" "}
        or{" "}
        <Mark tone="green" icon="language">
          Spanish
        </Mark>
        , and checks them against{" "}
        <Mark tone="red" icon="shield">
          your allergies
        </Mark>
        ,{" "}
        <Mark tone="yellow" icon="pill">
          your medications
        </Mark>{" "}
        and{" "}
        <Mark tone="green" icon="leaf">
          your diet
        </Mark>
        .
      </p>
    </section>
  );
}
