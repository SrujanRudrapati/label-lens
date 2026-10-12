# Label Lens — product spec

## One-line pitch
Point your phone at any label. Label Lens tells you what it means *for you*: in your language,
out loud, with every warning backed by the exact words on the label.

## Who it helps (say these in the demo)
- People with food allergies, checking packaged food in seconds
- People on multiple medications (often older adults or their caregivers) checking OTC medicine
- People reading labels in a language they don't speak well
- People with low vision (big text + read-aloud)

## Core user flow (the MVP, build this first, end to end)
1. **Home = camera.** One big "Scan a label" button (`<input type="file" accept="image/*"
   capture="environment">`), plus "Try a sample" chips (3 sample images).
2. **Instant read (Haiku, ~1–2 s):** shows product name + label type (food / medicine /
   household / other) over the photo. If unreadable: "Too blurry to read. Hold steady and
   retake." with a retake button.
3. **Deep analysis (Sonnet, parallel):** fills in:
   - plain-language summary (2–3 sentences, reading level ~grade 6)
   - "For you" stickers: flags matched against the profile (allergen, interaction, diet conflict)
   - general warnings on the label
   - key facts (active ingredients + strength / top allergens / key hazard)
   - each item shows its `evidence` quote; tapping a sticker reveals the quote
4. **Read aloud** button (speechSynthesis, uses the chosen language voice when available).
5. **Ask a question** box: follow-up chat with Haiku using the extracted text + analysis as
   context (no image resend). Streaming responses.

## Profile (local only, no account)
- Allergies (chips + free text), current medications (free text list), diet (vegan, halal,
  kosher, gluten-free, low-sodium...), preferred language (dropdown, default English).
- Stored in localStorage. Shown as "Saved on this device only."
- First-run: a 20-second profile setup, skippable.

## Structured output contract (Sonnet via forced tool use, validated with zod)
```ts
type Analysis = {
  labelType: "food" | "medicine" | "household" | "other";
  productName: string | null;
  readable: boolean;
  language: string;            // language the response is written in
  summary: string;
  personalFlags: Array<{
    severity: "danger" | "caution" | "info";
    kind: "allergen" | "interaction" | "diet" | "other";
    title: string;             // short, plain language
    explanation: string;
    evidence: string;          // exact text from the label
    profileMatch: string;      // which profile item triggered it
  }>;
  labelWarnings: Array<{ severity: "danger" | "caution" | "info"; text: string; evidence: string }>;
  keyFacts: Array<{ label: string; value: string }>;
  safeForYou: "yes" | "no" | "check" | "unknown";
  confidence: "high" | "medium" | "low";
  disclaimer: string | null;
};
```
Haiku quick pass returns: `{ readable, labelType, productName }`.

## Prompting rules for the analysis system prompt
- Only report what is visibly printed. If text is cut off, say so; lower confidence.
- `evidence` must be copied from the label, in its original language.
- Write everything else in the user's preferred language.
- Interactions: flag well-known interaction classes (e.g. NSAIDs + blood thinners) as "caution,
  confirm with a pharmacist"; never state dosing beyond what the label prints.
- Allergens: include "may contain"/"processed in a facility" lines as caution.

## API routes
- `POST /api/quick` → Haiku quick pass. Body: `{ image (base64 jpeg) }`.
- `POST /api/analyze` → Sonnet analysis. Body: `{ image, profile, language }`.
- `POST /api/ask` → Haiku streaming answer. Body: `{ question, analysis, profile, language }`.
- All routes: size limit ~4 MB, simple best-effort per-IP rate limit, and MOCK_AI=1 returns
  fixtures from `fixtures/*.json` keyed by sample id.

## Must-have polish (judges notice these)
- Skeleton states while waiting; no layout jump when Sonnet's result arrives
- Clear error states with a next action
- Works one-handed on a phone; tested at 375px wide
- Lighthouse accessibility score ≥ 95
- Footer: "Label Lens explains labels. It is not medical advice."

## Stretch (only after MVP is deployed and demo-ready)
1. Live viewfinder with getUserMedia + "hold steady" auto-capture
2. Scan history (localStorage) and "compare two products"
3. Lease / document mode for long-form fine print

## Out of scope
Accounts, databases, native apps, payments, anything requiring a paid service besides the Claude API.

## Acceptance criteria for "done"
- Deployed on Vercel, public URL works on a phone
- Works fully with MOCK_AI=1 and no key
- With a key: real photo → quick result < 3 s, full analysis < 12 s
- Profile with "peanut" allergy + scanning a peanut product shows a red sticker with evidence
- Profile with "warfarin" + scanning ibuprofen shows a caution interaction sticker
- Read aloud works; language switch to Spanish works end to end
- README complete per hackathon rules; no secrets in git history
