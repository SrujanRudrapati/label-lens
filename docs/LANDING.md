# Landing page redesign brief

Turn the home page into a full product landing page: a two-column hero with a phone
mockup, a highlighted sentence strip, numbered "how it works" steps on phone screens,
an annotated comparison section, stats, an FAQ, and a closing call to action.

## Ground rules

- Continue on the `landing-redesign` branch. Do NOT merge to main: hackathon judging
  runs until Oct 15, 3:00pm MDT and main is the live site.
- Do not copy any other site's text, images, icons, device frames or code. Every
  string below is ours; every visual is built with CSS/SVG or captured from our app.
- No invented social proof: no ratings, user counts or testimonials. Every number on
  the page must be verified against the repo (tests, fixtures, docs/STATUS.md) before
  it's used; if a number can't be verified, drop it.
- Use the frontend-design skill. Keep Atkinson Hyperlegible for all body and UI text,
  the sticker palette, and the footer disclaimer.

## Visual system

- Display font: Instrument Serif (next/font/google) for section headlines only.
  Hero headline about 80px desktop / 44px mobile, tight leading.
- Background: soft CSS-only sky gradient (paper #FAFBFC fading into pale blue at the
  top), with 2–3 large blurred radial "clouds". No photos.
- Buttons: large ink pill (#18263A) with a soft shadow; secondary actions are
  underlined text links.
- Phone mockups: one reusable CSS phone frame component (rounded body, thin bezel,
  dynamic-island notch, subtle side buttons, soft drop shadow). Screens inside are
  either the live app or real screenshots of our app (see "Screens" below).
- Highlights: phrases highlighted with sticker-colored backgrounds (yellow, red at low
  opacity, blue at low opacity, green at low opacity) with slightly rounded corners.
- Generous whitespace, sections max-width ~1120px, centered.

## Sections, in order

1. **Nav** (sticky, translucent on scroll): "Label Lens" wordmark left; links
   "How it works", "Proof", "FAQ" (anchor links); pill button "Open the app" that
   scrolls to and focuses the hero scan button.

2. **Hero** (two columns on desktop):
   - Chip: "Every warning quotes the label"
   - Headline (serif): "Read the fine print, made for you."
   - Step row with small icons and arrows:
     "Snap a label → Checks your allergies & meds → Shows the proof"
   - Primary pill: "Scan a label" (the real file input; keep it working).
     Below it, a text link: "or try a sample".
   - Trust line: "Free · No account · Your profile stays on this device"
   - Right column: the phone frame containing the REAL app at 390px, interactive,
     showing the snack sample result with stickers by default.

3. **Highlighted sentence strip** (large serif, centered, wraps naturally):
   "Label Lens reads [food labels], [medicine boxes] and [cleaning products], in
   [English] or [Spanish], and checks them against [your allergies], [your
   medications] and [your diet]."
   Each bracketed phrase is highlighted, with a small inline sticker-style icon.

4. **How it works** (id="how"), subtitle: "No sign-up. Just point your camera."
   Six numbered steps, each a phone screen + number + title + one line, laid out
   3 per row on desktop, 1 per row on mobile:
   1. "Tell it about you" — allergies, medications, diet, language. Stays on your phone.
   2. "Snap any label" — food, medicine or household products.
   3. "Instant first read" — the product name appears in about two seconds.
   4. "Warnings made for you" — color stickers for your allergies and medicines.
   5. "Tap for proof" — every sticker shows the exact words from the label.
   6. "Listen or ask" — hear it read aloud, or ask a follow-up question.

5. **Proof, not guesses** (id="proof"), an annotated comparison:
   - Left card, labeled "A typical AI answer (illustrative)": a short, confident,
     unsourced answer, e.g. "Good news! This bar is vegan and safe for most people.
     Enjoy!" with margin annotations: "No source", "Claims it can't know",
     "Ignores your allergy".
   - Right card, labeled "Label Lens": a red "Contains peanuts" sticker with its quote
     "CONTAINS: PEANUTS, SOY." and annotations: "Quotes the label", "Matched to your
     allergy", "Severity fits the risk".
   - Three trust bullets below: "Every warning quotes the label.", "It never says
     'vegan' or 'allergen-free' unless the label does.", "Medicine questions always
     point you to a pharmacist."

6. **Free and private**: one bold line, "Free. Private. Open source.", a sentence
   explaining no account and on-device profile, and a link to the GitHub repo.

7. **By the numbers** (verified only): three big stats, e.g. evidence quotes verified
   against the labels, seconds to the first read, automated tests. Pull each number
   from the repo; omit any you can't verify.

8. **FAQ** (id="faq"), heading "Questions, answered.", accessible accordion using
   <details>/<summary>:
   - Is this medical advice? (No; it explains labels and points you to a pharmacist.)
   - Where does my profile go? (Nowhere; it's stored on your device.)
   - What kinds of labels work? (Food, medicine and household products.)
   - What if my photo is blurry? (It says so and asks you to retake.)
   - How does it avoid making things up? (Evidence quotes, checks in code.)
   - Which languages are supported? (English and Spanish explanations.)
   - Does it cost anything? (No.)

9. **Closing CTA**: serif headline "Your next label, explained in seconds.",
   the "Scan a label" pill, and a phone showing the evidence sheet.

10. **Footer**: wordmark + one-line description; columns "Product" (How it works,
    Proof, FAQ, Open the app) and "Project" (GitHub, Demo video
    https://youtu.be/STqFvowDtD4); the disclaimer line.

## Screens

Capture the phone screens for sections 4, 5 and 9 from our own app with Playwright
in mock mode with the demo profile, at 390x844 and deviceScaleFactor 2. Save them as
optimized WebP under public/landing/ (each under 150 KB), lazy-loaded, with
descriptive alt text. Add a script so they can be regenerated.

## Mobile (<1024px)

- The hero comes first with the "Scan a label" pill one tap away, so the app still
  works camera-first. Hide the hero phone mockup on mobile (the visitor is already
  holding a phone).
- All other sections stack in one column; How-it-works phones at ~260px wide.

## Quality bar

- AA contrast on every gradient and highlight; visible focus states; reduced motion
  respected (no parallax or auto-animation when it's set).
- Lighthouse performance and accessibility at least 90 on the preview.
- Playwright screenshots of the full page at 1440, 1280 and 390 wide. Critique them
  against this brief, fix what's weak, and repeat once.
- Run build, lint and tests, commit, push the branch, and report the Vercel preview
  URL plus anything you cut.
