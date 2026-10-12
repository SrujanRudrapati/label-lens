"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PROFILE, Profile } from "./schema";

export const PROFILE_KEY = "label-lens:profile";
export const SETUP_KEY = "label-lens:setup-done";

/** Reads the saved profile; missing, blocked, or corrupted storage falls back to the empty default. */
export function loadProfile(): Profile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = Profile.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function setupWasDone(): boolean {
  try {
    return window.localStorage.getItem(SETUP_KEY) === "1";
  } catch {
    return false;
  }
}

/** Storage can be blocked (private mode); the profile then lives for this visit only. */
function persist(profile: Profile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(SETUP_KEY, "1");
  } catch {
    // Not saved across visits; the in-memory profile still works.
  }
}

export function profileItems(profile: Profile): string[] {
  return [...profile.allergies, ...profile.medications, ...profile.diet];
}

export interface UseProfile {
  profile: Profile;
  /** False until localStorage has been read, so first-run setup never flashes for returning users. */
  ready: boolean;
  /** True once the person has saved or skipped the first-run setup. */
  setupDone: boolean;
  save: (next: Profile) => void;
  skipSetup: () => void;
}

export function useProfile(): UseProfile {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [setupDone, setSetupDone] = useState(true);

  // localStorage is client-only, so read it after hydration to keep server and client markup equal.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(loadProfile());
    setSetupDone(setupWasDone());
    setReady(true);
  }, []);

  const save = useCallback((next: Profile) => {
    persist(next);
    setProfile(next);
    setSetupDone(true);
  }, []);

  const skipSetup = useCallback(() => {
    persist(loadProfile());
    setSetupDone(true);
  }, []);

  return { profile, ready, setupDone, save, skipSetup };
}
