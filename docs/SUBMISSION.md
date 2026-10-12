# Devpost submission text (ready to paste)

## Project name
Label Lens

## Tagline
Point your phone at any label and learn what it means for you, in your language, read aloud, with the label's own words as proof.

## Inspiration
Labels are written for everyone and read by one person at a time. A person with a peanut allergy has to scan every ingredient line. A person on warfarin has to know that common pain relievers can interact with it. Someone who reads Spanish better than English, or who has low vision, may not be able to read the fine print at all. The facts are on the package; what is missing is something that reads it for you, checks it against your life, and shows its work. And since a wrong answer about an allergy or a medicine matters, we wanted every warning to be traceable to words you can see on the package.

## What it does
Take a photo of a medicine box, food package, or household product. Within a couple of seconds you get the product name, then the warnings arrive as colored stickers on your photo, like the little stickers a pharmacist puts on a pill bottle: red for danger, yellow for caution, blue for a note. Tap a sticker and you see the exact text on the label behind it, plus a plain-language explanation. You can tell the app your allergies, medicines, diet, and language (optional, and it stays on your device), and it checks every label against them. Results can be read aloud, shown in Spanish, and you can ask follow-up questions that stream in. Every warning must quote the label; if it can't be quoted, it isn't shown.

## How we built it
Next.js (App Router), TypeScript, and Tailwind, deployed on Vercel with no database. A photo is downscaled in the browser and sent to our route handlers, which call two Claude models in parallel on the same image: Claude Haiku 5.5 for an instant first read (product, label type, readable or not), and Claude Sonnet 5.5 for the deep vision analysis. Sonnet returns structured JSON through a tool call whose schema is generated from our zod schema, and every response is validated with zod, with one retry that feeds the validation issues back to the model. A post-processing layer enforces the safety rules: every flag needs a quote, interaction flags are capped at caution and point to a pharmacist, cross-contact lines can't be rated as danger, and a dropped flag can never turn a warning into "no warnings". The profile lives in localStorage and is sent with each scan. Read aloud uses the browser's speechSynthesis, and the follow-up chat streams from Haiku. The UI design is built around pharmacy auxiliary warning stickers, with Atkinson Hyperlegible as the only typeface. A `MOCK_AI=1` mode replays real recorded model output, so anyone can run the full app with no API key. We built it with Claude Code, using the ECC configuration and the frontend-design skill, and ran five fresh-context reviews (code, TypeScript, security, silent failures, accessibility) before shipping.

## Challenges we ran into
- Stickers that looked great on a laptop were far too large on a real phone. They showed full sentences and covered each other. We added a separate short sticker title (28 characters or fewer) to the schema, moved the full sentence into the evidence sheet, and re-recorded the sample responses.
- Sonnet 5.5 rejects forced tool choice, so we use `auto` with an explicit instruction and a validate-and-retry loop instead.
- Keeping the model honest. Without rules, models love to say "no peanuts listed", which isn't evidence of absence. We forbid negative claims and require quotes, and we checked all 44 recorded evidence quotes (20 unique) against the label images by hand.
- Review found quiet failure modes, such as a corrupted saved profile silently becoming "no allergies", or dropping an unverifiable flag turning a warning green. We fixed those so the app says it couldn't check, instead of implying safety.

## Accomplishments that we're proud of
- Every warning is backed by the exact text from the label, and the UI makes that the main interaction.
- It runs in two languages with matching read-aloud, and evidence stays in the label's original language.
- Anyone can run it for free with `MOCK_AI=1` and no key.
- It was designed for low-vision users first: one highly legible typeface, large tap targets, high contrast, reduced-motion support, and screen-reader labels.
- A real, repeatable safety layer instead of "trust the model".

## What we learned
Structured output plus a validation loop makes a model dependable enough for a product, but the product still needs its own rules around the model. Requiring evidence changes the whole feel of the app: the user stops asking "is this right?" and starts reading the label. We also learned that testing on a real phone width early saves a redesign, and that a fresh-context review finds things the author is blind to.

## What's next
- More languages, starting with those with the highest need for label translation.
- Barcode lookup to cross-check a label against a product database.
- Saved scan history on the device, and an optional shared profile for caregivers.
- A pharmacist-reviewed interaction knowledge base to complement the model.
- A hard, shared rate limit for the public demo.

## Built with
Next.js, React, TypeScript, Tailwind CSS, Anthropic API, Claude Sonnet 5.5, Claude Haiku 5.5, zod, Web Speech API, Vercel, Vitest, Playwright, Atkinson Hyperlegible, Claude Code

## Links
- Live demo: https://label-lens-iota.vercel.app
- Code: https://github.com/SrujanRudrapati/label-lens
- Demo video: (add the YouTube/Vimeo link after uploading docs/demo/label-lens-demo.mp4)
