# Conversation — 2026-10-19 — Al-Bishara: modern reading font + no gappy justification

## Request
Replace the classic serif body font and the very-spaced justified text with a
modern, fluid, elegant font (suggested: Inter/Lora via Google Fonts CDN).

## Why the shared suggestion did not fit
- The book is **Arabic** (plus en/fr/es). Latin-only fonts (Lora/Inter) do not
  shape Arabic; the wrong family would look broken or fall back.
- The app **self-hosts fonts for offline** (`fonts.css`); adding a Google Fonts
  `<link>` would break offline reading.

## What was already available
`fonts.css` self-hosts **Amiri** (serif) and **Cairo** (modern geometric sans),
each with Arabic + Latin + Latin-ext subsets. So the elegant modern replacement
already exists in-repo: **Cairo**.

## Fix (single shared stylesheet — all languages)
- Added `--body-font` (Cairo stack) and set `body` to it, with font smoothing.
- Switched reading text from Amiri serif to `var(--body-font)`: `.card p`,
  `.card .sub`, `.chbody li`, `.chbody blockquote`, `.result .rsnip`.
- Removed the gappy `text-align: justify` on `.card p`, `.chbody li`,
  `.chbody blockquote` -> `text-align: start` (ragged-edge, no word-gaps).
- Tightened line-height 2.15/2.1 -> 1.9 (still airy, less vertical spread).

## Tests
- computed style, 4 languages: 4/4
  (Cairo loaded via document.fonts.check; text-align=start; no justify)
- book i18n suite 21/21; UI i18n suite 51/51
- index.html + SW CORE cache-buster `style.css?v=3 -> v=4`;
  SW `bishara-v1.0.7 -> v1.0.8`; root `DATA_MARKER v28 -> v29`
