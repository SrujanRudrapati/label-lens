"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PROFILE, Profile } from "./schema";

export const PROFILE_KEY = "label-lens:profile";
export const SETUP_KEY = "label-lens:setup-done";
const BACKUP_KEY = "label-lens:profile-unreadable";

export type ProfileNotice = "unreadable" | "not-saved" | null;

export interface LoadedProfile {
  profile: Profile;
  /** "unreadable" means something was saved but could not be read; the user must be told. */
  notice: ProfileNotice;
}

/** Reads the saved profile. Missing or blocked storage is just empty; unreadable data is kept aside and reported. */
export function readProfile(): LoadedProfile {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return { profile: DEFAULT_PROFILE, notice: null };
    const parsed = Profile.safeParse(JSON.parse(raw));
    if (parsed.success) return { profile: parsed.data, notice: null };
  } catch {
    if (raw === null) return { profile: DEFAULT_PROFILE, notice: null }; // storage blocked: nothing was lost
  }
  console.warn("[profile] saved profile could not be read; kept a backup and starting empty");
  try {
    if (raw) window.localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // best effort
  }
  return { profile: DEFAULT_PROFILE, notice: "unreadable" };
}

export function loadProfile(): Profile {
  return readProfile().profile;
}

function setupWasDone(): boolean {
  try {
    return window.localStorage.getItem(SETUP_KEY) === "1";
  } catch {
    return false;
  }
}

/** Storage can be blocked (private mode); the profile then lives for this visit only. */
function persist(profile: Profile): boolean {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(SETUP_KEY, "1");
    return true;
  } catch {
    console.warn("[profile] could not save to this device");
    return false;
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
  /** Set when the saved profile was unreadable, or a save did not stick. */
  notice: ProfileNotice;
  save: (next: Profile) => void;
  skipSetup: () => void;
}

export function useProfile(): UseProfile {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [setupDone, setSetupDone] = useState(true);
  const [notice, setNotice] = useState<ProfileNotice>(null);

  // localStorage is client-only, so read it after hydration to keep server and client markup equal.
  useEffect(() => {
    const loaded = readProfile();
    /* eslint-disable react-hooks/set-state-in-effect */
    setProfile(loaded.profile);
    setNotice(loaded.notice);
    setSetupDone(setupWasDone() && loaded.notice === null);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const save = useCallback((next: Profile) => {
    setNotice(persist(next) ? null : "not-saved");
    setProfile(next);
    setSetupDone(true);
  }, []);

  const skipSetup = useCallback(() => {
    // Never overwrite saved data with an empty profile: skipping only records that setup was seen.
    try {
      window.localStorage.setItem(SETUP_KEY, "1");
    } catch {
      // setup will simply be offered again next visit
    }
    setSetupDone(true);
  }, []);

  return { profile, ready, setupDone, notice, save, skipSetup };
}
