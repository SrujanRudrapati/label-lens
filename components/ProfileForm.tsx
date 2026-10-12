"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Profile } from "@/lib/schema";

type ListKey = "allergies" | "medications" | "diet";

const MAX_ITEM_CHARS = 60;

const FIELDS: readonly { key: ListKey; label: string; hint: string; suggestions: readonly string[] }[] = [
  { key: "allergies", label: "Allergies", hint: "For example peanut", suggestions: ["peanut", "milk", "gluten"] },
  { key: "medications", label: "Medicines you take", hint: "For example warfarin", suggestions: ["warfarin", "aspirin"] },
  { key: "diet", label: "Diet", hint: "For example vegan", suggestions: ["vegan", "vegetarian"] },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

function withItem(list: readonly string[], raw: string): string[] {
  const item = raw.trim().slice(0, MAX_ITEM_CHARS);
  if (!item || list.some((x) => x.toLowerCase() === item.toLowerCase())) return [...list];
  return [...list, item];
}

interface ListFieldProps {
  id: string;
  field: (typeof FIELDS)[number];
  items: readonly string[];
  draft: string;
  onDraft: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (item: string) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

function ListField({ id, field, items, draft, onDraft, onAdd, onRemove, inputRef }: ListFieldProps) {
  const open = field.suggestions.filter((s) => !items.some((x) => x.toLowerCase() === s));
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-bold">{field.label}</legend>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
                className="flex min-h-12 items-center gap-2 rounded-full border border-rule-strong bg-white pr-3 pl-4 font-bold"
              >
                {item}
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <label htmlFor={id} className="sr-only">
          Add to {field.label.toLowerCase()}
        </label>
        <input
          id={id}
          ref={inputRef}
          value={draft}
          maxLength={MAX_ITEM_CHARS}
          placeholder={field.hint}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            onAdd(draft);
          }}
          className="min-h-12 min-w-0 flex-1 rounded-sheet border border-rule-strong bg-white px-4"
        />
        <button type="button" onClick={() => onAdd(draft)} className="min-h-12 rounded-full border border-rule-strong bg-white px-5 font-bold">
          Add
        </button>
      </div>
      {open.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`Quick picks for ${field.label.toLowerCase()}`}>
          {open.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => onAdd(s)} className="min-h-12 rounded-full px-3 text-ink-soft underline decoration-rule-strong decoration-2 underline-offset-4">
                + {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

interface ProfileFormProps {
  initial: Profile;
  submitLabel: string;
  onSubmit: (profile: Profile) => void;
  secondary?: { label: string; onClick: () => void };
}

/** Allergies, medicines, diet and language. Anything typed but not yet added is kept when saving. */
export function ProfileForm({ initial, submitLabel, onSubmit, secondary }: ProfileFormProps) {
  const base = useId();
  const [draftProfile, setDraftProfile] = useState<Profile>(initial);
  const inputs = useRef<Partial<Record<ListKey, HTMLInputElement | null>>>({});
  const [announcement, setAnnouncement] = useState("");
  const [drafts, setDrafts] = useState<Record<ListKey, string>>({ allergies: "", medications: "", diet: "" });

  function add(key: ListKey, value: string) {
    setDraftProfile((p) => ({ ...p, [key]: withItem(p[key], value) }));
    setDrafts((d) => ({ ...d, [key]: "" }));
    if (value.trim()) setAnnouncement(`Added ${value.trim()}`);
    // The pressed quick-pick unmounts, so keep focus somewhere stable.
    inputs.current[key]?.focus();
  }

  function remove(key: ListKey, item: string) {
    setDraftProfile((p) => ({ ...p, [key]: p[key].filter((x) => x !== item) }));
    setAnnouncement(`Removed ${item}`);
    inputs.current[key]?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const merged = FIELDS.reduce((p, f) => ({ ...p, [f.key]: withItem(p[f.key], drafts[f.key]) }), draftProfile);
    onSubmit(merged);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {FIELDS.map((f) => (
        <ListField
          key={f.key}
          id={`${base}-${f.key}`}
          field={f}
          items={draftProfile[f.key]}
          draft={drafts[f.key]}
          onDraft={(value) => setDrafts((d) => ({ ...d, [f.key]: value }))}
          onAdd={(value) => add(f.key, value)}
          onRemove={(item) => remove(f.key, item)}
          inputRef={(el) => {
            inputs.current[f.key] = el;
          }}
        />
      ))}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold">Language for results</legend>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <label key={l.code} className="has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink flex min-h-12 cursor-pointer items-center rounded-full border border-rule-strong bg-white px-5 font-bold">
              <input
                type="radio"
                name={`${base}-language`}
                value={l.code}
                checked={draftProfile.language === l.code}
                onChange={() => setDraftProfile((p) => ({ ...p, language: l.code }))}
                className="sr-only"
              />
              <span lang={l.code}>{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="sr-only" role="status">
        {announcement}
      </p>

      <p className="text-meta text-ink-soft">Saved on this device only. It is sent with each scan so the answer fits you, and never stored on a server.</p>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="min-h-14 rounded-sheet bg-ink px-8 text-lead font-bold text-paper">
          {submitLabel}
        </button>
        {secondary && (
          <button type="button" onClick={secondary.onClick} className="min-h-14 rounded-sheet px-4 font-bold underline decoration-rule-strong decoration-2 underline-offset-4">
            {secondary.label}
          </button>
        )}
      </div>
    </form>
  );
}
