# Label Lens 🔍

**Point your phone at any label. Label Lens tells you what it means for *you*: in your language,
read aloud, with every warning backed by the exact words on the label.**

Live demo: <VERCEL_URL> · Demo video: <VIDEO_URL>

## The problem
<!-- 3–4 sentences: allergies, multiple medications, language barriers, low vision. -->

## What it does
<!-- The core flow in 4–5 short lines + 2 screenshots. -->

## How AI is used
- **Two Claude models in parallel.** Claude Haiku 5.5 gives an instant first read (product, label
  type, readable or not) while Claude Sonnet 5.5 performs the full vision analysis.
- **Structured output.** Sonnet returns a strict schema via forced tool use, validated with zod.
- **Evidence grounding.** Every flag must quote the exact label text it came from, which keeps
  the model from inventing ingredients or warnings.
- **Personalization.** Results are cross-checked against the user's allergies, medications and
  diet, stored only on their device.
- **Multilingual.** Explanations in the user's language; evidence kept in the label's original.
- **Follow-up Q&A** with Haiku using the extracted analysis as context (no image resend).

## Run it locally
```bash
git clone <REPO_URL> && cd label-lens
npm install
# No API key? Run the full app on recorded sample responses:
MOCK_AI=1 npm run dev
# With a key:
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

## Built with
<!-- Next.js, TypeScript, Tailwind, Anthropic SDK (Claude Sonnet 5.5, Claude Haiku 5.5), zod,
     Web Speech API, Vercel, Vitest, Playwright, Atkinson Hyperlegible font. Link each. -->

## What we didn't build ourselves
<!-- Open-source libraries and APIs above. Development was assisted by Claude Code using the
     MIT-licensed ECC configuration and Anthropic's frontend-design skill. All application code
     was written during the hackathon. -->
- Sample label images are fictional products created for this project.

## Team
<!-- Names -->

## Disclaimer
Label Lens explains labels. It is not medical advice. Always confirm medication questions with a
pharmacist or doctor.
