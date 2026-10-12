# Label Lens: build plan

## Timebox (hard stops, local MST)
| Phase | What | Done by |
|---|---|---|
| 2 Scaffold + deploy | Next app, tokens, schema + tests, mock plumbing, Vercel live | 02:30 |
| 3 AI pipeline | 3 routes, record real fixtures, try script | 05:00 |
| 4 Core experience | capture → quick → stickers → evidence | 08:00 |
| 5 Personal layer | profile, read aloud, ask chat, Spanish | 09:45 |
| 6 Harden | 5 agent reviews, secrets scan, e2e, Lighthouse, iOS check | 11:15 |
| 7 README + ship | README, screenshots, final deploy | 12:00 |
| Video + submit | record, edit, upload, submit on Devpost | 12:00–13:00 (hard) |

Phases 4–6 are compressed. If any of them overruns its stop, apply the cut list rather than borrowing time from 7 or the video.

**Cut list, in order, if behind:** Ask streaming (switch to a non-streamed reply) → Haiku-says-unreadable cancel (keep the retake UI, drop the abort wiring) → 1280px polish → the Playwright test (keep the unit tests). Never cut: evidence on stickers, mock mode, disclaimer, the deploy.

## Phases and files

### Phase 2: Scaffold + deploy
- `package.json`, `tsconfig.json` (strict), `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`
- `app/layout.tsx`: Atkinson Hyperlegible via `next/font/google` (400 + 700), footer disclaimer
- `app/globals.css`: Tailwind v4 `@theme` tokens (below)
- `app/page.tsx`: placeholder home
- `lib/models.ts`: `QUICK_MODEL = "claude-haiku-5-5"`, `ANALYSIS_MODEL = "claude-sonnet-5-5"`, `ASK_MODEL`, plus max_tokens constants
- Install `zod@^4` and confirm with `npm ls zod` that it resolves to 4.x, because `z.toJSONSchema` exists only in v4. If something forces v3, fall back to `zod-to-json-schema`.
- `lib/schema.ts`: zod `QuickResult`, `Analysis`, `Profile`, and request-body schemas, with `.max()` caps on strings and arrays
- `lib/env.ts`: `isMock()` and a lazily checked `ANTHROPIC_API_KEY` (mock mode never needs it)
- `lib/schema.test.ts`
- `.env.example` (placeholder names only); create `.gitignore` (the repo has none yet) covering `.env*.local`, `node_modules`, `.next`, `.vercel` before any `git add .`

### Phase 3: AI pipeline
- `lib/anthropic.ts`: server-only client singleton (`import "server-only"`)
- `lib/prompts.ts`: QUICK_SYSTEM, ANALYSIS_SYSTEM, ASK_SYSTEM
- `lib/tools.ts`: tool definitions. The JSON schema is derived from zod (`z.toJSONSchema`) so there is one source of truth.
- `lib/callTool.ts`: shared "forced tool call → zod parse → retry once with the error fed back → typed error" helper used by quick and analyze
- `lib/guard.ts`: body-size check (4 MB), base64/JPEG check, and an in-memory per-IP token bucket. This is best-effort only: limits are per serverless instance.
- `app/api/quick/route.ts`, `app/api/analyze/route.ts`, `app/api/ask/route.ts` (streams `text/plain` from `messages.stream`)
- `scripts/try.ts` (run with `npx tsx`): runs a sample through quick + analyze and prints the JSON. With `--save`, it writes the result as a fixture.
- `lib/mock.ts` + `fixtures/{sampleId}.{en|es}.json`
- `app/api/analyze/route.test.ts`: replaying a fixture returns profile-dependent flags

**Fixtures are real model output, not hand-written.** Once the routes work with the real key:
1. Run `scripts/try.ts --save` for each sample (snack, snack-es, ibuprofen, cleaner, blurry) in `en` and `es` using a **recording profile**. That profile is a superset of everything the demo needs: allergies peanut + tree nuts, med warfarin, diet vegan.
2. Review each JSON by hand for evidence quotes that really appear on the label, a correct `readable:false` for blurry, and Spanish prose with English evidence. Re-record any sample that's wrong; never edit model text.
3. Commit the fixtures, about 20 API calls in total.

**How replay works:** the client sends `sampleId` when a sample chip is used. `lib/mock.ts` loads the recorded fixture and keeps only the personal flags whose `profileMatch` matches an item in the current profile (case-insensitive contains, either direction). It recomputes `safeForYou` from the remaining flags, and all other fields stay verbatim. Replay is used when `MOCK_AI=1` (no key needed) and for sample chips on the live site (`SAMPLES_USE_FIXTURES=1`, set in Vercel), which controls cost. Real photos always use live AI when a key is present. A real photo in `MOCK_AI` mode gets a clear "No API key here. Try a sample." message. The response carries `source: "saved" | "live"`, and the result screen shows a small ink-soft note, "Saved example", under the product name when the result was replayed.

### Phase 4: Core experience
- `lib/image.ts`: client-side downscale. Uses `createImageBitmap(file, {imageOrientation:"from-image"})` with an `<img>` fallback, then a canvas at longest edge 1568 → `toBlob("image/jpeg", .85)` → base64.
- `lib/useScan.ts`: a state machine (idle → reading → quick-ready → done / unreadable / error) that fires quick + analyze in parallel with `AbortController`, aborting analyze when quick says unreadable
- `components/CaptureButton.tsx`, `SampleChips.tsx`, `PhotoStage.tsx` (photo plus sticker layer), `Sticker.tsx`, `EvidenceSheet.tsx`, `ResultBody.tsx` (summary, warnings, key facts), `Skeletons.tsx`, `ErrorState.tsx`
- `app/page.tsx` (home) and the result view as a client state of the same page, so there is no route hop and the photo stays mounted
- `e2e/screens.spec.ts`: screenshots at 375 and 1280 for the critique pass

### Phase 5: Personal layer
- `lib/profile.ts`: `useProfile` hook (localStorage with try/catch, zod-validated on read, so corrupted data → defaults)
- `components/ProfileSetup.tsx` (first run, skippable) and `ProfileSheet.tsx` (edit)
- `lib/speak.ts`: picks a voice by language prefix and waits for `voiceschanged`. The Read aloud button reads summary + flags.
- `components/AskBox.tsx`: reads the stream with `ReadableStream` reader. Mock mode streams a canned answer chunk by chunk.

### Phase 6: Harden
Run five fresh-context ECC agent reviews in parallel, each in its own context and seeing only the code: `code-reviewer`, `typescript-reviewer`, `security-reviewer`, `silent-failure-hunter`, `a11y-architect`. Merge their findings, dedupe them, and fix only real issues (bugs, security, a11y failures, swallowed errors); style nits are noted but skipped. Then `git log -p --all | grep -E "sk-ant-"` plus a gitleaks-style pattern scan; `e2e/happy.spec.ts` (mock: sample → sticker → evidence); Lighthouse a11y on the live URL ≥ 95; manual iOS checklist.

### Phase 7: README + ship
Fill in the README template, including the sentence: "Sample buttons on the live site replay saved responses recorded from the real models, to control cost; photos you take use live AI." Add `docs/screenshots/{home,result}.png`.

## Risks and how each is handled
| Risk | Handling |
|---|---|
| **iOS camera input** | Use plain `<input type=file accept="image/*" capture="environment">`, no getUserMedia. iOS may return HEIC from the library, but Safari decodes it into canvas, and the downscale always re-encodes JPEG. EXIF rotation is handled by `imageOrientation:"from-image"`. Reset `input.value` after each pick so the same photo can be retaken. Manual test on a real iPhone in Phase 6. |
| **Image size** | Downscale client-side to ≤1568px / q0.85 (~200–400 KB). The server rejects bodies over 4 MB with 413 before parsing, which also stays under Vercel's 4.5 MB function body limit. JPEG magic bytes are checked. |
| **JSON reliability** | Forced `tool_choice: {type:"tool"}`, the tool schema is generated from zod, `safeParse`, and one retry that includes the zod issues. After that, a typed error → "Couldn't read this label clearly. Retake?" A post-parse **evidence guard** drops any flag whose `evidence` is empty. |
| **Hallucinated flags** | The prompt requires a verbatim `evidence` quote. Interaction flags are capped at "caution" and must mention a pharmacist (enforced in post-processing: severity is clamped and the pharmacist line is appended if missing). |
| **Latency** (quick < 3 s, full < 12 s) | Run in parallel. Quick uses Haiku with max_tokens 200 and a tiny schema. Analyze uses max_tokens ~1500. Prompt caching via `cache_control` on the system block. Caching needs a minimum prefix length (≈1k tokens on Sonnet, more on Haiku), so short prompts silently won't cache, which is harmless. Images are sent at ≤1568px to avoid server-side resizing. Route `maxDuration = 30`. |
| **Cost on the public demo** | $5 console spend cap, the per-IP limiter, max_tokens caps, and sample chips replaying recorded fixtures on the live site. Only real photos hit the API. |
| **Medical safety** | A calm disclaimer on every result. The emergency regex (swallowed / poison / overdose) in Ask returns a fixed "call emergency services / poison control" message before calling the model. |

> The demo video uses real photos, which always go to live AI, so the replayed samples don't conflict with DEMO_SCRIPT's instruction to record with the real API.

---

# Design plan

**Subject:** pharmacy auxiliary warning stickers, the small saturated labels a pharmacist sticks on a bottle ("May cause drowsiness", "Do not take with…"). Their vernacular is a die-cut rounded rectangle, a heavy sans, a tiny pictogram at the left, a solid color field, a slightly crooked application, and a white die-cut edge. That is the signature, and it shows up only on the result photo. Everything else stays paper and ink.

## Tokens
| Token | Hex | Role |
|---|---|---|
| `paper` | #FAFBFC | page ground |
| `ink` | #18263A | text, primary button fill |
| `ink-soft` | #4A5A70 | secondary text (contrast ≈7:1 on paper) |
| `rule` | #DCE2EA | hairlines, input borders |
| `sticker-yellow` | #FFD23F | caution, with ink text |
| `sticker-red` | #E5484D | danger/allergen, with white text, bold ≥19px only (≈3.9:1, passes large-text AA) |
| `sticker-blue` | #3E7BFA | info, with white text, bold ≥19px only |
| `sticker-green` | #2FA36B | safe for you, with ink text (≈4.8:1) |

The sticker colors are never used for plain text on paper. Status is never conveyed by color alone: every sticker has a pictogram + word. Contrast gets verified in Phase 4.

Radii: 6px for stickers (die-cut feel), 14px for sheets/inputs, full for chips. Shadow: only stickers get one (`0 1px 0 rgba(24,38,58,.25), 0 6px 14px -6px rgba(24,38,58,.35)`), which reads as a sticker lifted slightly off the photo. Nothing else gets a shadow.

## Type: Atkinson Hyperlegible only (400, 700)
Scale (ratio 1.25, base 18px for low-vision readers): 14.4 meta · **18 body** (line-height 1.5) · 22.5 lead/sticker title (700) · 28 section heading · 35 screen title (700, tracking −0.01em). Measure ≤ 62ch. Sentence case everywhere; no all-caps labels and no eyebrows. Numbers in key facts use tabular figures.

## Layout (mobile-first at 375; content column max 560px, centered at 1280 with the photo allowed to 720px)

**Home**
```
┌───────────────────────────┐
│ Label Lens       For you ▸│  ← wordmark left; profile pill shows "Peanut, warfarin"
│                           │
│ Point at a label.         │  35/700, left aligned
│ We'll explain what it     │  18 ink-soft
│ means for you.            │
│                           │
│ ┌───────────────────────┐ │
│ │ 📷  Scan a label      │ │  full-width, 64px tall, ink fill, paper text
│ └───────────────────────┘ │
│                           │
│ Or try one of ours        │
│ [▢ Snack] [▢ Pain relief] │  chips with 40px thumbnails, each styled as a
│ [▢ Cleaner] [▢ Spanish]   │  small paper label with a sticker-color edge
│                           │
│ Saved on this device only │
│───────────────────────────│
│ Label Lens explains labels│  footer disclaimer
└───────────────────────────┘
```
All text is left aligned. The scan button sits in the bottom-third thumb zone on tall phones (flex spacer).

**Result** (the photo stays where it is; everything fills in below without a jump)
```
┌───────────────────────────┐
│ ◂ Retake      Read aloud ▶│
│ ┌───────────────────────┐ │
│ │      [photo]          │ │  photo, max 55vh, object-contain, rounded 14
│ │  ┌──────────────┐     │ │
│ │  │⚠ Contains    │ ↺-3°│ │  stickers stuck along the lower-left of the photo,
│ │  │  peanuts     │     │ │  overlapping its bottom edge, each rotated
│ │ ┌┴─────────────┐┘     │ │  −4°…+3° (seeded by index), stacked, max 3 visible
│ └─│ ⓘ Take with   │─────┘ │  + a "+2 more" sticker
│   │   food        │       │
│   └───────────────┘       │
│ Peanut Butter Bites       │  28/700 (from Haiku, appears first)
│ Food label                │  14.4 ink-soft
│                           │
│ ▌"Contains: peanuts, …"   │  EvidenceSheet: opens inline under the photo when a
│ ▌ Matches your allergy:   │  sticker is tapped; left bar in the sticker's color,
│ ▌ peanut                  │  quote in 22.5, then the explanation
│                           │
│ Not safe for you          │  verdict line in 22.5/700 + pictogram
│ Summary paragraph…        │
│ On the label  (warnings)  │  plain list, pictogram + text, no cards
│ Key facts     (dl grid)   │
│ Ask a question  [_____] ▶ │
│ Calm disclaimer           │
└───────────────────────────┘
```
Skeletons: the title, summary, and sticker slots reserve their final heights (the sticker slot is 3 grey pill outlines at the same rotations), so nothing shifts when Sonnet arrives. At 1280px the photo and stickers sit in the left column and the text in the right, both starting at the top.

## The signature moment
When the analysis lands, the stickers "apply" one after another (80ms stagger): scale 1.08→1 and rotate to the resting angle with a short overshoot, 220ms. This is the only non-triggered motion in the app. With `prefers-reduced-motion`, they simply appear. Each sticker is a `<button>` with an `aria-label` such as "Danger: contains peanuts. Show label text". The result region is `aria-live="polite"` and announces only "Analysis ready, 2 warnings for you".

## Principles
1. Bold only on the photo. The rest is paper, ink, and one rule color.
2. Every colored thing on the page is a sticker, and every sticker leads to a label quote.
3. Big targets (≥48px), visible 3px ink focus ring offset 2px, one hand, thumb zone.
4. Copy is plain verbs in sentence case: "Scan a label", "Retake", "Read aloud", "Show label text". Errors say what happened and what to do next.

## Review against the brief (what changed)
- The first draft put the result in a stack of rounded summary cards, which is the generic SaaS kit. I replaced it with a plain typographic list; the only "objects" are stickers.
- Sample chips were plain grey pills. They are now mini labels with a sticker-color edge, tying them to the subject without spending boldness.
- I dropped the idea of a colored verdict banner across the top. It competed with the stickers, so the verdict is now a quiet text line with a pictogram.
- Literal sticker positions (bounding boxes) were rejected because model bbox output is unreliable and would add schema risk. Stickers are applied along the photo edge like a pharmacist would, not over the matching text.
