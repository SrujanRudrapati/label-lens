"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Analysis } from "./schema";

const FALLBACK_LANG: Record<string, string> = { en: "en-US", es: "es-ES" };
const MAX_CHUNK_CHARS = 180;
const SEVERITY_ORDER = { danger: 0, caution: 1, info: 2 } as const;
const GOOD_VOICE_RE = /premium|enhanced|natural|google/i;

/** What Read aloud says: the name, the summary, the personal flags, then the label's own warnings. */
export function buildSpeech(analysis: Analysis): string {
  const bySeverity = [...analysis.personalFlags].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const flags = bySeverity.map((f) => `${f.title}. ${f.explanation}`);
  const warnings = analysis.labelWarnings.map((w) => w.text);
  return [analysis.productName, analysis.summary, ...flags, ...warnings, analysis.disclaimer]
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim())
    .join(" ");
}

/** Splits into sentence-sized chunks: some browsers cut off a single long utterance. */
export function chunkSpeech(text: string): string[] {
  const sentences = text.match(/[^.!?¡¿]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > MAX_CHUNK_CHARS) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** The best installed voice for a language code like "es": same language, preferring natural-sounding ones. */
export function pickVoice(voices: readonly SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
  const matching = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(language.toLowerCase()));
  return matching.find((v) => GOOD_VOICE_RE.test(v.name)) ?? matching.find((v) => v.default) ?? matching[0] ?? null;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export interface UseSpeech {
  supported: boolean;
  speaking: boolean;
  /** True when the browser reported a real playback failure (not a user stop). */
  failed: boolean;
  toggle: (text: string, language: string) => void;
  stop: () => void;
}

/** speechSynthesis wrapper. Voices load late in most browsers, so they are cached and refreshed on voiceschanged. */
export function useSpeech(): UseSpeech {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const session = useRef(0);
  // Held so the browser can't garbage-collect in-flight utterances before their end events fire.
  const queued = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;
    const refresh = () => {
      voices.current = synth.getVoices();
    };
    refresh();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    synth.addEventListener("voiceschanged", refresh);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      synth.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    session.current++;
    if (speechSupported()) window.speechSynthesis.cancel();
    setSpeaking(false);
    setFailed(false);
  }, []);

  const toggle = useCallback(
    (text: string, language: string) => {
      if (!speechSupported()) return;
      if (speaking) return stop();

      const synth = window.speechSynthesis;
      const mine = ++session.current;
      const voice = pickVoice(voices.current, language);
      const chunks = chunkSpeech(text);
      if (chunks.length === 0) return;
      synth.cancel();
      queued.current = [];
      setFailed(false);
      setSpeaking(true);
      chunks.forEach((chunk, i) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = voice?.lang ?? FALLBACK_LANG[language] ?? language;
        if (voice) utterance.voice = voice;
        const finish = () => {
          if (i === chunks.length - 1 && session.current === mine) setSpeaking(false);
        };
        queued.current.push(utterance);
        utterance.onend = finish;
        utterance.onerror = (e) => {
          if (session.current === mine && e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("[speech]", e.error);
            setFailed(true);
          }
          finish();
        };
        try {
          synth.speak(utterance);
        } catch (err) {
          console.warn("[speech]", err);
          setFailed(true);
          setSpeaking(false);
        }
      });
    },
    [speaking, stop],
  );

  return { supported, speaking, failed, toggle, stop };
}
