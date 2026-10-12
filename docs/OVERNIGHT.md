# Overnight run: Phases 5–8

Run these phases in order, unattended. After EACH phase: run build, lint and tests, fix
failures, commit and push, then continue. If something is blocked after 2 attempts, note it
in docs/STATUS.md, skip it, and move on. Never push a broken build.

## Notes before starting

- Stickers are too big on a real phone (real-photo test at 390px): they show full sentences,
  and the overlap hides the first line of the sticker underneath. Fix: stickers show a short
  title only (max ~28 characters, e.g. "Contains peanut", "May contain milk"; add a short
  sticker title field to the schema if needed and re-record fixtures), sticker text at 18px
  bold on mobile, and the overlap must never cover text. The full sentence goes in the
  evidence sheet. Re-check with Playwright at 390px. Do this first, before Phase 5.
- In Phase 5, add the Read aloud button to the result top bar as the design plan had it.
- In Phase 7, also fix the two "forced tool_choice" mentions in docs/PLAN.md.

## PHASE 5 (Personal layer)

Per docs/PLAN.md: profile in localStorage with skippable first-run setup, profile sent to
/api/analyze, Read aloud via speechSynthesis with a voice matching the language, streaming
Ask box. Verify the peanut-allergy and warfarin + ibuprofen cases and the Spanish flow.

## PHASE 6 (Harden)

Run separate fresh-context reviews with code-reviewer, typescript-reviewer,
security-reviewer, silent-failure-hunter and a11y-architect; fix real issues only. Scan the
repo and full git history for secrets. Add the Playwright happy-path test in mock mode.

## PHASE 7 (README + submission text)

Fill in README.md completely per the hackathon rules: what it does, the problem, how AI is
used (accurate to the current code: Haiku + Sonnet in parallel, structured output, evidence
grounding and the 45-quote verification, safety post-processing, local-only profile),
install/run including MOCK_AI=1, tools/libraries with links, "what we didn't build
ourselves" (include: sample labels are fictional and were generated for this project; built
with Claude Code using ECC and the frontend-design skill), team member: Srujan, screenshots
from docs/screenshots/.

Then write docs/SUBMISSION.md with ready-to-paste Devpost text: tagline, Inspiration, What it
does, How we built it, Challenges, Accomplishments, What we learned, What's next, and
"Built with" tags.

## PHASE 8 (Demo video, fully automated)

- Script: docs/demo/script.md, 6–8 segments, total 2:30–2:50. Cover: intro (Srujan, Label
  Lens, the problem; no invented personal stories, use real-world framing), set profile
  (peanut allergy, warfarin), scan snack → red peanut sticker → tap for evidence, scan
  ibuprofen → caution interaction sticker → evidence → Read aloud, switch to Spanish →
  Spanish result, ask a follow-up question → streamed answer, a "how the AI works" slide
  (Haiku + Sonnet in parallel, structured output, every warning quotes the label, profile
  stays on device), closing with live URL (https://label-lens-iota.vercel.app) + GitHub.
- Narration: macOS `say`. Run `say -v '?'` and pick the best English voice, preferring one
  marked Premium or Enhanced. One audio file per segment.
- Recording: Playwright with recordVideo, phone viewport 390x844 at deviceScaleFactor 2,
  against a local production build using the REAL API (SAMPLES_USE_FIXTURES=0), feeding
  images from public/samples via setInputFiles. Wait for real results; pace each segment
  to its narration length.
- Slides (title, how-AI-works, closing): HTML in the app's design tokens and font, captured
  with Playwright.
- Assemble with ffmpeg (use the ffmpeg-static npm package if ffmpeg isn't installed):
  1920x1080, phone recording centered on a paper-colored background, burned-in captions of
  the narration, narration audio, no music. Output docs/demo/label-lens-demo.mp4. Verify
  with ffprobe that it is under 2:55. Add *.mp4 to .gitignore.
- Extract 6 frames from the final video into docs/demo/frames/ and check them yourself for
  broken layout, cut-off text or loading spinners stuck on screen; re-record any bad
  segment.

## At the end

Write docs/STATUS.md: what's done, the video path and length, the live URL, anything
skipped, and exactly what I must do by hand.
