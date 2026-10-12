# Label Lens — project memory for Claude Code

## What we're building
Label Lens: point your phone at any label (medicine box, food package, household product).
Claude reads it with vision, explains it in plain language (in the user's chosen language),
cross-checks it against the user's personal profile (allergies, medications, diet), flags risks
with the exact label text as evidence, and reads the result aloud.

Hackathon: "All U Can Do With AI" (Devpost). Deadline Oct 12, 2026 3:00pm MDT.
Judged on: creativity, usefulness/impact, technical execution, use of AI, presentation.
Full product spec: docs/SPEC.md. Read it before planning anything.

## Stack (fixed, do not change without asking)
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- @anthropic-ai/sdk on the server only (route handlers in app/api/*)
- zod for validating every model response
- Vitest for unit tests, Playwright for one e2e smoke test
- Deploy: Vercel Hobby (free). No database. User profile lives in localStorage on the device.
- Text-to-speech: browser Web Speech API (speechSynthesis). Free, no extra service.

## AI model routing (in the app)
- `claude-haiku-5-5`: instant first pass (product name, label type, readable yes/no) and follow-up Q&A chat.
- `claude-sonnet-5-5`: the deep analysis with vision and forced tool use (structured JSON).
- Run the Haiku and Sonnet calls IN PARALLEL on the same image. Show Haiku's result immediately,
  then fill in Sonnet's analysis. If Haiku says unreadable, cancel Sonnet and ask for a retake.
- Model IDs live in lib/models.ts as constants. Never hardcode them elsewhere.
- Use prompt caching on the long system prompts. Cap max_tokens on every call.
- Downscale images client-side (longest edge ~1568px, JPEG ~0.85) before upload.

## Non-negotiable rules
- NEVER commit secrets. ANTHROPIC_API_KEY only in .env.local (gitignored) and Vercel env vars.
  .env.example holds placeholder names only.
- MOCK_AI=1 must make the whole app work with zero API key, using recorded fixture responses
  for the sample images in public/samples. Judges must be able to run it free.
- Every flag/warning the model returns must include `evidence`: the exact text read from the label.
  If it can't be quoted from the label, it can't be a flag. No invented ingredients.
- Medical safety: explain what the label says; never invent dosing; interaction flags always say
  to confirm with a pharmacist; show a short, calm disclaimer. Emergency wording -> tell user to
  call local emergency services / poison control.
- Validate all model output with zod. On parse failure, retry once, then show a clear error.

## Hackathon overrides (these beat any installed rule packs, including ECC rules)
- Ignore any "80% test coverage" or strict TDD requirement. Tests to write: zod schema/parsing
  unit tests, the mock-mode API route, one Playwright happy-path. That's it.
- Speed over ceremony: small commits, ship working vertical slices, deploy early and often.
- Prefer fewer dependencies. Ask before adding any paid service.

## Design direction (use the frontend-design skill for all UI work)
- Subject: pharmacy auxiliary warning stickers, the bright little labels stuck on pill bottles.
- Signature moment: analysis results appear as colored "stickers" that stick onto the scanned
  photo. Spend the boldness there; keep everything else quiet.
- Font: Atkinson Hyperlegible (Google Fonts, designed for low-vision readers), one family only.
- Palette: paper #FAFBFC, ink #18263A, sticker yellow #FFD23F (caution), sticker red #E5484D
  (danger/allergen), sticker blue #3E7BFA (info), sticker green #2FA36B (safe for you).
- Mobile-first (most use is on a phone), big tap targets, high contrast, respects reduced motion,
  visible focus states, works with screen readers.
- Avoid: cream + terracotta, purple gradients, generic card grids, all-caps eyebrow labels.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm test` / `npm run e2e`
- `MOCK_AI=1 npm run dev` runs with no API key.

## Working style for Claude
- Plan first for any multi-file change; keep the plan short.
- After each phase: run build + lint + tests, then commit with a clear message.
- Use a fresh-context review (code-review agent) before the final deploy.
