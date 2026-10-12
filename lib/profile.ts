"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PROFILE, Profile } from "./schema";

export const PROFILE_KEY = "label-lens:profile";

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

export function profileItems(profile: Profile): string[] {
  return [...profile.allergies, ...profile.medications, ...profile.diet];
}

export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  // localStorage is client-only, so read it after hydration to keep server and client markup equal.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setProfile(loadProfile()), []);
  return profile;
}
