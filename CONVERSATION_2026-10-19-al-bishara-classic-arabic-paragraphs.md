# Conversation — 2026-10-19 — Al-Bishara: classic Arabic (Amiri) in paragraphs only, Latin untouched

## Request
Restore the traditional Arabic look (tashkeel/vowels + classical ligatures, as in
the reference image) **in paragraphs only — not in titles** — while keeping the
Latin characters (en/fr/es) exactly as they are now (Cairo).

## Approach
Self-hosted fonts already include both candidates, so no Google Fonts CDN:
- **Amiri** = classic Arabic with diacritics.
- **Cairo** = the current modern font (must stay for Latin + titles).

A plain `font-family: 'Amiri', 'Cairo', ...` would NOT work, because fonts.css
defines Amiri with *latin* subsets — Latin glyphs would render in Amiri.

**Fix: a script-scoped `unicode-range`.** Added `@font-face` blocks for a new
family **`AmiriPara`** that reuse the *same* `amiri-400-arabic.woff2` /
`amiri-700-arabic.woff2` files but with the **Arabic-only unicode-range**.
Result: Arabic codepoints resolve to Amiri; Latin codepoints skip AmiriPara and
fall through to Cairo.

## Changes
- `fonts.css`: + `AmiriPara` (400 + 700), Arabic `unicode-range` (includes Tashkeel).
- `style.css`: + `--para-font: 'AmiriPara', 'Cairo', ...`; applied to the body-text
  rules only: `.card p`, `.chbody li`, `.chbody blockquote`, `.result .rsnip`.
  Line-heights restored for diacritics: p 1.9 -> 2.15, li/blockquote -> 2.1,
  rsnip -> 2. `text-align: start` kept (no gappy justify).
- Titles/metadata unchanged: `body` + `.card .sub` still `--body-font` (Cairo);
  `.card h2` / `.chbody h3` inherit Cairo.
- index + SW: `fonts.css?v=1 -> v=2`; SW `bishara-v1.0.9 -> v1.0.10`;
  root `DATA_MARKER v30 -> v31`.

## Verification (glyph-level, via text metrics)
For both `ar` and `en` UI:
- Arabic paragraph metrics: stack 129 vs pure-Cairo 178 -> **Amiri**, not Cairo.
- Latin paragraph metrics: stack 197 === pure-Cairo 197 -> **Cairo, exactly unchanged**.
- `.card p` computed font-family = `AmiriPara`; `.card h2` = `Cairo`.
- Suites: book i18n 21/21; UI i18n 51/51; offline (app SW) renders `AmiriPara`.
