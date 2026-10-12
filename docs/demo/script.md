# Demo video script

Target 2:30–2:50. Narration is macOS `say` (Ava, Enhanced). The phone segments are recorded with Playwright against a local production build using the real API.

| # | Start | Length | On screen |
|---|---|---|---|
| 01-intro | 0:00 | 29s | Title slide: Label Lens, with three stickers. |
| 02-profile | 0:28 | 12s | Phone: first-run setup. Type peanut (allergy) and warfarin (medicine), language English, Save. |
| 03-snack | 0:41 | 25s | Phone: scan the snack bar photo (live API). Product name appears, then the red Contains peanuts sticker. Tap it to show the label quote. |
| 04-ibuprofen | 1:05 | 22s | Phone: scan the ibuprofen label (live API). Yellow Interacts with warfarin sticker, tap for the quote and the pharmacist line, then tap Read aloud. |
| 05-spanish | 1:27 | 24s | Phone: switch language to Español in the profile sheet, scan again, Spanish result; type a follow-up question and watch the answer stream in. |
| 06-how | 1:51 | 27s | Slide: how the AI works (Haiku + Sonnet in parallel, structured output, evidence, local profile). |
| 07-close | 2:18 | 19s | Closing slide: live URL and GitHub. |

Total: 2:37

## 01-intro

**On screen:** Title slide: Label Lens, with three stickers.

**Narration:** Hi, I'm Srujan, and this is Label Lens. Medicine boxes, snack packages and cleaning products all carry important warnings in very small print. If you have a food allergy, take a blood thinner, read another language better, or have low vision, that fine print is hard to use, and mistakes can be serious. Label Lens reads the label for you, checks it against your own profile, and shows exactly where every warning comes from.

## 02-profile

**On screen:** Phone: first-run setup. Type peanut (allergy) and warfarin (medicine), language English, Save.

**Narration:** First, a quick profile. I add a peanut allergy and the medicine warfarin, and keep the language on English. It is saved only on this phone. It is never stored on a server.

## 03-snack

**On screen:** Phone: scan the snack bar photo (live API). Product name appears, then the red Contains peanuts sticker. Tap it to show the label quote.

**Narration:** Now I scan a snack bar. In a couple of seconds Label Lens names the product, and then the warnings land as stickers on the photo. Contains peanuts, in red, because that matches my allergy. I tap the sticker, and it shows the exact words from the label: contains peanuts, soy. Nothing is guessed. If it can't be quoted from the label, it isn't shown.

## 04-ibuprofen

**On screen:** Phone: scan the ibuprofen label (live API). Yellow Interacts with warfarin sticker, tap for the quote and the pharmacist line, then tap Read aloud.

**Narration:** Next, a pain reliever. Ibuprofen belongs to a family of medicines that can interact with warfarin, so I get a yellow caution sticker. Tapping it shows the label text it came from, and it tells me to confirm with a pharmacist. It never invents doses. And if I would rather listen, Read aloud speaks the result.

## 05-spanish

**On screen:** Phone: switch language to Español in the profile sheet, scan again, Spanish result; type a follow-up question and watch the answer stream in.

**Narration:** Label Lens works in Spanish too. I switch the language and scan again, and the explanation comes back in Spanish, while the evidence stays in the label's own words so I can match it on the package. Then I can ask a follow-up question. The answer streams in, and it points me back to a pharmacist.

## 06-how

**On screen:** Slide: how the AI works (Haiku + Sonnet in parallel, structured output, evidence, local profile).

**Narration:** Here is how it works. Two Claude models run in parallel on the same photo. Haiku gives an instant first read. Sonnet does the deep analysis and returns structured, validated results. Every warning must quote the label, or it is dropped. If a photo is too blurry to read, the first read catches it within seconds, and you are asked to retake it instead of getting a guess. And your profile stays on your device.

## 07-close

**On screen:** Closing slide: live URL and GitHub.

**Narration:** Label Lens. Read the fine print for you. It works in any phone browser, it needs no account, and anyone can run it for free in demo mode. Try it at label dash lens dash iota dot vercel dot app, and find the code on GitHub under Srujan Rudrapati. Thanks for watching.

## Rebuild

```bash
npm run build && PORT=3200 npm start        # real API, no MOCK_AI
export DEMO_TOOLS=<dir with ffmpeg-static + ffprobe-static installed>
node scripts/demo/audio.mjs && node scripts/demo/slides.mjs
node scripts/demo/record.mjs && node scripts/demo/assemble.mjs
```
