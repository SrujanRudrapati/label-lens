# Kickoff: setup + the exact prompts to give Claude Code

## 0. One-time setup (≈15 min)
1. Install Node.js 20+, Git, and Claude Code (official install guide: https://code.claude.com/docs).
2. Create an empty public GitHub repo named `label-lens`, clone it, and copy these starter files in
   (CLAUDE.md, docs/, README.md, DEMO_SCRIPT.md, .env.example, .gitignore).
3. Dev tooling (install each ONE way only, don't stack):
   - ECC, lean profile, no hooks (keeps context small):
     `npx ecc-universal@2.2.3 install --profile minimal --target claude`
   - Inside Claude Code: `/plugin install frontend-design@claude-plugins-official`
   - Do NOT also install Superpowers; it overlaps with ECC's planning and review workflows.
4. API key: create one at console.anthropic.com, put it in `.env.local` only.
   In the Console, set a low monthly spend limit (e.g. $5) so a public demo can't run up a bill.
5. Take 3 photos yourself for samples (your own photos, no copyright issues):
   a snack with a nut allergen line, an OTC pain reliever box (ibuprofen/naproxen), and a
   cleaning product. Save to `public/samples/`.

## How to drive Claude Code
- Plan with Opus 5.5 (`/model`, then plan mode with Shift+Tab). Build with Sonnet 5.5.
- Run `/clear` between phases so each starts with fresh context; CLAUDE.md reloads automatically.
- After each phase: build + lint + test + commit. Deploy after phase 2 and every phase after.

## Phase 1 — Plan (Opus 5.5, plan mode)
> Read CLAUDE.md and docs/SPEC.md fully. Produce a short implementation plan as phases with
> files per phase, matching the phases in KICKOFF.md. Call out risks (camera input on iOS,
> image size, JSON reliability, latency) and how you'll handle each. Then use the
> frontend-design skill to write a compact design plan (tokens, type scale, layout sketch of
> the home and result screens) honoring the design direction in CLAUDE.md. Save both to
> docs/PLAN.md. Don't write app code yet.

## Phase 2 — Scaffold + deploy (Sonnet 5.5)
> Execute phase "scaffold" from docs/PLAN.md: Next.js + TS strict + Tailwind, Atkinson
> Hyperlegible, design tokens, lib/models.ts, zod schemas in lib/schema.ts with unit tests,
> .env.example, MOCK_AI plumbing, a placeholder home screen. Verify `npm run build`, lint and
> tests pass, commit, then walk me through deploying to Vercel (I'll click the buttons).

## Phase 3 — AI pipeline (Sonnet 5.5)
> Implement /api/quick, /api/analyze and /api/ask exactly per docs/SPEC.md: forced tool use for
> structured output, zod validation with one retry, prompt caching on system prompts, max_tokens
> caps, size limit, best-effort rate limit, MOCK_AI fixtures for the 3 samples in
> public/samples. Write the analysis system prompt carefully following "Prompting rules" in the
> spec. Add a scripts/try.ts that runs a sample image through both routes and prints the JSON.
> Run it in mock mode, show me the output.

## Phase 4 — The core experience (Sonnet 5.5 + frontend-design skill)
> Build the home/capture screen and the result screen per docs/PLAN.md: client-side image
> downscaling, parallel quick + analyze calls, quick result shown immediately, sticker-style
> flags placed over the photo (the signature moment), tap a sticker to see its evidence,
> skeletons with no layout jump, retake flow, error states. Mobile-first at 375px. Then take
> screenshots (use Playwright) of home, loading, and result at 375px and 1280px and critique
> them against the design plan; fix what's weak.

## Phase 5 — Personal layer (Sonnet 5.5)
> Add the profile (allergies, meds, diet, language) stored in localStorage with a skippable
> first-run setup; pass it to /api/analyze; add Read aloud via speechSynthesis using a voice
> matching the language; add the Ask-a-question streaming chat. Verify both acceptance cases in
> the spec (peanut allergy, warfarin + ibuprofen) work in mock mode and with the real API.

## Phase 6 — Harden (Opus 5.5 for review)
> Run /code-review with a fresh-context reviewer and fix real findings. Then check for secrets:
> scan the repo and full git history for API keys. Add the Playwright happy-path test in mock
> mode. Run Lighthouse accessibility on the deployed URL and fix anything under 95. Check iOS
> Safari camera input works (tell me what to test manually on my phone).

## Phase 7 — README + ship (Sonnet 5.5)
> Fill in README.md completely from the template: what it does, problem, how AI is used (model
> routing, parallel calls, structured output, evidence grounding), install/run (including
> MOCK_AI=1 no-key mode), tools/APIs/libraries with links, and a clear "what we didn't build
> ourselves" section. Add 2 screenshots. Final deploy, then verify the live URL end to end.

## When stuck (paste this)
> Stop. Explain in 3 sentences what's failing and what you've tried. List 2 alternative
> approaches with tradeoffs. Pick the faster one that keeps the demo working.
