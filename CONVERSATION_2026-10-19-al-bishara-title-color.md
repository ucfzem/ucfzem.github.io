# Conversation — 2026-10-19 — Al-Bishara: brighter dark-mode title text

## Request
Make chapter/title text brighter and more comfortable to read on the dark background
(suggested greens: #4ade80, #86efac, #2dd4bf).

## What was actually in the codebase
Titles were not styled via bare `h3` / `.chapter-title` (the shared suggestion).
Real selectors used `color: var(--green)`, which in dark mode is `#48bb78`.
Content sub-headings / bold titles render from `.chbody b`, `.chbody h3`,
`.part-block h3`, plus UI titles `.card h2`, `.home h1/h2`, `.toc-item .num`,
`.result .rtitle`, `.drawer-head strong`.

## Fix (single shared stylesheet — applies to EVERY language already)
- Added `--title` CSS variable: light `#2e6f40` (== old green, no visual change),
  dark `#86efac` (soft pastel green, comfortable on dark charcoal).
- Repointed all title/heading text selectors from `var(--green)` to `var(--title)`.
- Left backgrounds/borders/hovers on `var(--green)` (only `.result:hover`
  `border-color` remains).

No per-language work needed: the stylesheet is shared, so ar/en/fr/es all inherit it.

## Tests
- computed title color, 4 languages × {dark, light}: 8/8
  (dark #86efac = rgb(134,239,172); light #2e6f40 = rgb(46,111,64))
- book i18n suite 21/21; UI i18n suite 51/51
- SW `bishara-v1.0.6 → v1.0.7`; root `DATA_MARKER v27 → v28`
