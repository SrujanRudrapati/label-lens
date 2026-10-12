// One source of truth for the demo: what is spoken, what is captioned, and what is on screen.
// `spoken` is tuned for the voice (URLs spelled out); `caption` is what the viewer reads.
export const LIVE_URL = "https://label-lens-iota.vercel.app";
export const GITHUB_URL = "https://github.com/SrujanRudrapati/label-lens";

export const SEGMENTS = [
  {
    id: "01-intro",
    kind: "slide",
    slide: "title",
    spoken:
      "Hi, I'm Srujan, and this is Label Lens. Medicine boxes, snack packages and cleaning products all carry important warnings in very small print. If you have a food allergy, take a blood thinner, read another language better, or have low vision, that fine print is hard to use, and mistakes can be serious. Label Lens reads the label for you, checks it against your own profile, and shows exactly where every warning comes from.",
  },
  {
    id: "02-profile",
    kind: "app",
    spoken:
      "First, a quick profile. I add a peanut allergy and the medicine warfarin, and keep the language on English. It is saved only on this phone. It is never stored on a server.",
  },
  {
    id: "03-snack",
    kind: "app",
    spoken:
      "Now I scan a snack bar. In a couple of seconds Label Lens names the product, and then the warnings land as stickers on the photo. Contains peanuts, in red, because that matches my allergy. I tap the sticker, and it shows the exact words from the label: contains peanuts, soy. Nothing is guessed. If it can't be quoted from the label, it isn't shown.",
  },
  {
    id: "04-ibuprofen",
    kind: "app",
    spoken:
      "Next, a pain reliever. Ibuprofen belongs to a family of medicines that can interact with warfarin, so I get a yellow caution sticker. Tapping it shows the label text it came from, and it tells me to confirm with a pharmacist. It never invents doses. And if I would rather listen, Read aloud speaks the result.",
  },
  {
    id: "05-spanish",
    kind: "app",
    spoken:
      "Label Lens works in Spanish too. I switch the language and scan again, and the explanation comes back in Spanish, while the evidence stays in the label's own words so I can match it on the package. Then I can ask a follow-up question. The answer streams in, and it points me back to a pharmacist.",
  },
  {
    id: "06-how",
    kind: "slide",
    slide: "how",
    spoken:
      "Here is how it works. Two Claude models run in parallel on the same photo. Haiku gives an instant first read. Sonnet does the deep analysis and returns structured, validated results. Every warning must quote the label, or it is dropped. If a photo is too blurry to read, the first read catches it within seconds, and you are asked to retake it instead of getting a guess. And your profile stays on your device.",
  },
  {
    id: "07-close",
    kind: "slide",
    slide: "close",
    spoken:
      "Label Lens. Read the fine print for you. It works in any phone browser, it needs no account, and anyone can run it for free in demo mode. Try it at label dash lens dash iota dot vercel dot app, and find the code on GitHub under Srujan Rudrapati. Thanks for watching.",
    caption: `Label Lens. Read the fine print for you. It works in any phone browser, needs no account, and anyone can run it for free in demo mode. Try it at ${LIVE_URL} and find the code on GitHub: SrujanRudrapati/label-lens. Thanks for watching.`,
  },
];

export const captionOf = (seg) => seg.caption ?? seg.spoken;
