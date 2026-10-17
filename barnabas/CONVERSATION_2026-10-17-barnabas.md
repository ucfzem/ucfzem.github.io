# Conversation — Barnabas App Build (إنجيل برنابا)
Date: 2026-10-17

## Summary
Built a complete Arabic RTL PWA reader for **إنجيل برنابا** (Gospel of Barnabas), Arabic translation by Dr. Khalil Saadeh (Dar al-Manar, 1908). Mirrored Ibn Fadlan app architecture. Data: 222 chapters, `content` is a string (split into paragraphs in JS). Features: TOC drawer, global + per-chapter search with highlight/counter/next-prev, theme (light/dark), font size A-/A+/reset, reading progress bar, back-to-top, hash routing `#chapter-N` (also `read/N`), offline SW, web manifest.

## App Location
- `/tmp/opencode/barnabas-app/` (standalone app)

## Key Files Created
- `index.html` — RTL shell, themeBoot (barnabas_theme, barnabas_font), drawer, progress, toTop
- `style.css` — palette (light #fdfbf7/#f7f4ee/#2e6f40, dark #12181b/#1a202c/#48bb78), Amiri/Scheherazade New for body, Cairo/Tajawal for UI
- `app.js` — load `./data/barnabas.json`, home (global search), reader (chapter search), drawer, progress, routing, splitIntoParagraphs
- `sw.js` — barnabas-cache-v1.0.0, precache CORE+fonts
- `manifest.json` — name "إنجيل برنابا", theme_color #0f5c5a, RTL
- `icon.svg` — teal bg #0f5c5a, open book + bookmark + star (distinct from Ibn Fadlan ship)
- `icon-192.png`, `icon-512.png` (rendered via Playwright)
- `tools/render_icons.mjs`
- `.nojekyll`, `README.md`, `.gitignore`
- `data/barnabas.json` (existing, 222 chapters, content string)

## Technical Notes
- localStorage keys: `barnabas_theme`, `barnabas_font`, `barnabas_last`
- Hash routing supports `#chapter-N` and `#/read/N`
- Content rendered as paragraphs by grouping ~3 sentences (whitespace-only)
- Search: global on home shows results with counter/snippets; per-chapter with next/prev + current highlight
- Offline-first via SW (precache data + fonts)

## Git/Push Context
App is built locally in `/tmp/opencode/barnabas-app/`. To publish under `ucfzem.github.io`, it should be deployed as `/tmp/opencode/ucfzem.github.io/barnabas/` (or pushed to that repo path) so the live URL becomes `https://ucfzem.github.io/barnabas/`.

## Maktaba (works)
Intended to add Barnabas card/link to Maktaba folder in `ucfzem.github.io/works/index.html` (Arabic books section).
