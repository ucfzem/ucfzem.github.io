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

## v1.2.0 — Full categorized TOC skeleton (48 stories / 5 أبواب)

- Used the user-provided list of story **titles + أبواب structure** (table of contents — facts, not book body text) to generate a complete categorized skeleton.
- New tool `tools/build_toc_skeleton.py` generates `data/sahih-al-qasas.json` with all 48 titles across the 5 أبواب; `content` left as a placeholder for the book text.
- App now shows the **full 48-story TOC grouped by the 5 أبواب** immediately (previously only 6 starter stories).
- Content for each story is filled by running `tools/extract*.js|py` on the user's own book PDF (copyrighted body text NOT reproduced — placeholders only).
- `sahih-al-qasas/sw.js` bumped to `sahih-al-qasas-v1.2.0` (data changed → offline refresh).
- Extractors (`extract.js`, `extract_stories.py`) improved: stronger story-header regex (Arabic ordinals 1–50, Hindi/Arabic digits), fuzzy باب detection, PDF page-furniture cleanup, clean-title extraction.

## Git/Push Context (v1.2.0)

- Commit `Sahih al-Qasas: full 48-story categorized TOC skeleton (5 أبواب); content via extraction` (pushed)
- `works/` untouched — all entries preserved



## Huweeni book question + v1.3.0 — Browser PDF→JSON tool (phone-only workflow)

- User asked whether «صحيح القصص النبوي» by **أبو إسحاق الحويني** is available "بدون قيود" (without restrictions).
- Research answer: only **الجزء الأول (قصص 1–50)** exists — printed by مكتبة الصحابة، جدة، 1411هـ، ~92pp; available on المكتبة الوقفية / الشاملة / مكتبة عين. **No full موسوعة published.** It is a **modern copyrighted work** (Huweeni, b. 1949) — free PDF on archive sites ≠ public domain; عين University explicitly states حقوق النشر محفوظة. So: readable/quotable by the user personally, but not free to reproduce publicly. Same boundary as the Al-Ashqar book.
- User answered **«لا»** to building a Huweeni skeleton — app stays as-is (Al-Ashqar, 48 titles / 5 أبواب).
- User then said: **«لا أستطيع فعل كل هذا بمجرد هاتف محمول»** (cannot run the Node/Python extractors — phone only).
- **Solution (v1.3.0): new browser-based extractor `tools/pdf2json.html`** — no Termux, no computer, no installs:
  - Opens directly on the phone browser: https://ucfzem.github.io/sahih-al-qasas/tools/pdf2json.html
  - **All processing runs client-side** (pdf.js from cdnjs) — the PDF never leaves the device; only the user's own downloaded JSON can be shared.
  - Two input modes: pick a **PDF file** (text-layer PDFs) or **paste text** (fallback for scanned PDFs / Shamela copy-paste).
  - Editable bookInfo (title/author, prefilled), split mode toggle (strict line-start / loose any-position).
  - Same splitting engine as `tools/extract.js`: Arabic ordinals 1–50 + digits, sequential باب/known-category detection, page-furniture cleanup, short-segment filtering.
  - Live preview before download: story count, أبواب breakdown, per-story title/category/content length (⚠ flags short segments), warnings (single باب detected, TOC noise in loose mode).
  - Download button produces **`sahih-al-qasas.json`** in the exact app schema — user sends it via Droppy (or any transfer) and we deploy it.
- Also: app footer now links to the tool; `sw.js` bumped to `sahih-al-qasas-v1.3.0`, precaches `./tools/pdf2json.html`, runtime-caches `cdnjs.cloudflare.com` (for pdf.js) after first use (not precached to avoid ~1MB for every visitor).

## Git/Push Context (v1.3.0)

- Commit `Sahih al-Qasas v1.3.0: browser-based PDF-to-JSON extractor (works on phone, runs locally)` (pushed, `d9b8574`)
- Verified live with `Cache-Control: no-cache`:
  - `/sahih-al-qasas/tools/pdf2json.html` → 200
  - `/sahih-al-qasas/sw.js` → `v1.3.0`
  - `/sahih-al-qasas/` footer link → present (1)
  - cdnjs `pdf.min.js` + `pdf.worker.min.js` (3.11.174) → 200
  - `works/` card → still 1 match (untouched)
- Standalone source `/tmp/opencode/sahih-al-qasas-app/` re-synced (index/styles/sw + tool).
