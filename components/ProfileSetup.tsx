"use client";

import { useEffect, useRef } from "react";
import type { Profile } from "@/lib/schema";
import { ProfileForm } from "./ProfileForm";

interface ProfileSetupProps {
  initial: Profile;
  onSave: (profile: Profile) => void;
  onSkip: () => void;
}

/** First run only: about twenty seconds, and fully skippable. */
export function ProfileSetup({ initial, onSave, onSkip }: ProfileSetupProps) {
  // Setup replaces the landing page from wherever the visitor tapped; start them at its top, on its heading.
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section aria-labelledby="setup-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 id="setup-title" ref={titleRef} tabIndex={-1} className="text-title leading-tight font-bold tracking-[-0.01em]">
          What should we watch for?
        </h1>
        <p className="max-w-[62ch] text-lead text-ink-soft">Tell us once, and every label is checked against it. You can skip this and change it later.</p>
      </div>
      <ProfileForm initial={initial} submitLabel="Save and continue" onSubmit={onSave} secondary={{ label: "Skip for now", onClick: onSkip }} />
    </section>
  );
}
