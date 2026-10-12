"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Analysis, Profile } from "@/lib/schema";

const MAX_QUESTION_CHARS = 500;

type AskState =
  | { phase: "idle" }
  | { phase: "streaming"; question: string; answer: string }
  | { phase: "done"; question: string; answer: string }
  | { phase: "error"; question: string; message: string };

const ERROR_TEXT: Record<number, string> = {
  429: "That's a lot of questions at once. Wait a moment and ask again.",
};

async function readStream(res: Response, onText: (text: string) => void): Promise<void> {
  if (!res.body) throw new Error("no body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  text += decoder.decode();
  onText(text);
}

interface AskBoxProps {
  analysis: Analysis;
  profile: Profile;
  language: string;
}

/** Follow-up questions about this label. The answer streams in as it is written. */
export function AskBox({ analysis, profile, language }: AskBoxProps) {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<AskState>({ phase: "idle" });
  const controller = useRef<AbortController | null>(null);
  const inputId = useId();

  useEffect(() => () => controller.current?.abort(), []);

  async function ask(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || state.phase === "streaming") return;

    controller.current?.abort();
    const ctl = new AbortController();
    controller.current = ctl;
    setState({ phase: "streaming", question: q, answer: "" });
    setQuestion("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, analysis, profile, language }),
        signal: ctl.signal,
      });
      if (!res.ok) {
        setState({ phase: "error", question: q, message: ERROR_TEXT[res.status] ?? "Couldn't get an answer. Please try again." });
        return;
      }
      await readStream(res, (answer) => setState({ phase: "streaming", question: q, answer }));
      setState((s) => (s.phase === "streaming" ? { phase: "done", question: q, answer: s.answer } : s));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({ phase: "error", question: q, message: "Couldn't reach Label Lens. Check your connection and try again." });
    }
  }

  const busy = state.phase === "streaming";
  return (
    <section aria-labelledby="ask-heading" className="flex flex-col gap-3">
      <h2 id="ask-heading" className="text-section font-bold">
        Ask a question
      </h2>
      <form onSubmit={ask} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Your question about this label
        </label>
        <input
          id={inputId}
          value={question}
          maxLength={MAX_QUESTION_CHARS}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Can I take this with food?"
          className="min-h-14 min-w-0 flex-1 rounded-sheet border border-rule-strong bg-white px-4"
        />
        <button
          type="submit"
          disabled={busy || question.trim().length === 0}
          className="min-h-14 rounded-sheet bg-ink px-5 font-bold text-paper disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      {state.phase !== "idle" && (
        <div className="flex flex-col gap-1 border-l-[6px] border-sticker-blue py-1 pl-4" aria-busy={busy}>
          <p className="text-meta text-ink-soft">You asked: {state.question}</p>
          {state.phase === "error" ? (
            <p role="alert">{state.message}</p>
          ) : (
            <p className="max-w-[62ch] whitespace-pre-wrap">{state.answer || <span className="text-ink-soft">Thinking…</span>}</p>
          )}
        </div>
      )}
      {/* Announced once, when the whole answer is in, so a screen reader doesn't chatter through the stream. */}
      <p className="sr-only" aria-live="polite">
        {state.phase === "done" ? state.answer : ""}
      </p>
    </section>
  );
}
