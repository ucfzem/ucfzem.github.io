# Conversation — Sahih al-Qasas App Build (صحيح القصص النبوي)

Date: 2026-10-17

## Summary

Built a complete Arabic RTL PWA reader for **صحيح القصص النبوي** (Sahih al-Qasas al-Nabawi) by Dr. Omar Soulayman Al-Ashqar (رحمه الله). Mirrored the Nuzhat al-Mushtaq / Ibn Fadlan / Barnabas app architecture exactly. Features: TOC drawer, global + per-story search with highlight/counter/next-prev, theme (light/dark), font size A-/A+/reset, reading progress bar, back-to-top, hash routing `#story-N` (also `read/N`, `chapter-N`), offline SW, web manifest (RTL standalone).

## App Location

- Standalone build: `/tmp/opencode/sahih-al-qasas-app/`
- Deployed in site repo: `/tmp/opencode/ucfzem.github.io/sahih-al-qasas/`
- Live URL: `https://ucfzem.github.io/sahih-al-qasas/`

## Key Files Created

- `index.html` — RTL shell, themeBoot (`qasas_theme`, `qasas_font`), drawer, progress, toTop
- `styles.css` — palette (light `#fdfbf7`/`#f7f4ee`/`#2e6f40`, dark `#12181b`/`#1a202c`/`#48bb78`), Amiri/Scheherazade New body, Cairo/Tajawal UI
- `app.js` — load `./data/sahih-al-qasas.json`, home (global search), reader (story search), drawer, progress, routing, `splitIntoParagraphs`
- `sw.js` — `sahih-al-qasas-v1.0.0`, precache CORE + fonts CSS
- `manifest.webmanifest` — name "صحيح القصص النبوي", theme_color `#2e6f40`, RTL, standalone
- `icon.svg` — emerald `#2e6f40` bg, open book + crescent/star (distinct identity)
- `icon-192.png`, `icon-512.png` (rendered via Playwright)
- `tools/render_icons.mjs`
- `.nojekyll`, `README.md`, `.gitignore`
- `data/sahih-al-qasas.json` — starter set of accurate, source-attributed hadith stories (classical texts from Bukhari/Muslim, public-domain religious sources)

## Technical Notes

- localStorage keys: `qasas_theme`, `qasas_font`, `qasas_last`
- Hash routing supports `#story-N`, `#/read/N`, `#chapter-N`
- JSON schema: `{ bookInfo, stories: [{ id, number, title, content, summary }] }`
- Content rendered as paragraphs (whitespace-aware; sentence grouping of ~3 as fallback)
- Search: global on home (counter/snippets) + per-story with next/prev + current highlight
- Offline-first via SW (precache data + fonts CSS)
- Note: starter data uses authentic hadith texts with original-source attribution; full book text can be swapped into the same JSON structure

## Git/Push Context

- Deployed under site repo path `sahih-al-qasas/` → live at `https://ucfzem.github.io/sahih-al-qasas/`
- Committed `Add Sahih al-Qasas PWA reader and Maktaba card` (pushed)

## Maktaba (works)

- Added card: `{ emoji: "📿", name: "صحيح القصص النبوي", tag: "Hadith", icon: "https://ucfzem.github.io/sahih-al-qasas/icon.svg", url: "https://ucfzem.github.io/sahih-al-qasas/" }`
- `works/sw.js` bumped to `works-v1.0.16` to include new icon for offline

## v1.1.0 — Full book structure (categories) + extraction tools

- App now supports the `category` field on each story:
  - Grouped home TOC by the 5 أبواب (category headers).
  - Category label shown at top of each story card.
  - `bookInfo.totalStories` honored in the home heading.
- `app.js` `loadData()` maps `c.category`; `renderGroupedToc()` groups by category.
- `styles.css` adds `.cat` and `.cat-head` styles.
- Shipped extraction tools in `sahih-al-qasas/tools/`:
  - `extract_stories.py` (pdfplumber) — extracts stories + باب category detection.
  - `extract.js` (pdf-parse) — Node.js equivalent.
  - `render_icons.mjs` — icon rendering.
- Data schema now:
  ```json
  { "bookInfo": { "totalStories": 57, ... },
    "stories": [ { "id", "number", "category", "title", "content", "summary?" } ] }
  ```
- Starter data remains a small set of accurate, source-attributed classical hadiths (Bukhari/Muslim); run the extractor on the book PDF to populate all 57 stories.

## Git/Push Context (v1.1.0)

- Commit `Sahih al-Qasas: add category support, grouped TOC, extraction tools` (pushed)
- `sahih-al-qasas/sw.js` bumped to `sahih-al-qasas-v1.1.0`
- `works/` left untouched (verified: no diff) — all Maktaba entries preserved

