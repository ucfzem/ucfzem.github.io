# Conversation backup — 2026-10-19

## Objective
Publish the user's app «البشارة بنبي الإسلام في كتب اليهود والنصارى» on GitHub Pages (`https://ucfzem.github.io/al-bishara/`) and place it in the **Maktaba** folder of the works linktree.

## Key decisions
- Book content is user-supplied (user pasted 5 parts themselves in conversation); treated as their document, included verbatim in `data/chapters.json`.
- Abandon `next export` (removed in Next 14); build static single-page app (barnabas pattern) served from `/al-bishara/`.
- Icon: shape-only SVG (open book + radiant star, deep green gradient + gold border, no Arabic text — no Arabic fonts in environment).
- Root SW: add `'al-bishara'` to `SHELLS` + `APPS` + bump `DATA_MARKER` v21→v22 so devices re-precache.
- Works card already appended in `works/index.html` maktaba array (emoji📖, name "البشارة بنبي الإسلام", tag "Islamic Studies", icon URL `https://ucfzem.github.io/al-bishara/icon.svg`, `newTab:true`).
- Works SW bumped `works-v1.0.21→works-v1.0.22` with `icon.svg` + `icon-192.png` precache entries.

## Files created
- `al-bishara/index.html` — RTL Arabic reader (adapted from `barnabas/`), with parts grouping (front, part1, part2, back), search, highlight, font controls, theme, drawer.
- `al-bishara/style.css` — same palette as `barnabas` (green/gold), additions for `h3`, `blockquote`, `chbody`, `part-block`.
- `al-bishara/app.js` — block-based rendering (sanitized HTML: b, li, ul, ol, blockquote), highlight-on-text-nodes, global search across 20 chapters, per-chapter search with navigation, font/theme/progress, copy chapter, hash routing.
- `al-bishara/sw.js` — `CACHE 'bishara-v1.0.0'`, `CORE` includes `./data/chapters.json`, `./icon.svg`, `./icon-192.png`, `./icon-512.png`.
- `al-bishara/manifest.json` — PWA manifest with icons 192/512 + SVG, theme_color `#0f5c5a`.
- `al-bishara/icon.svg` — custom design (rounded square green/gold, open book, radiant light/star, no Arabic text).
- `al-bishara/icon-192.png`, `icon-512.png` — rendered via Playwright from icon.svg.
- `al-bishara/data/chapters.json` — {meta, parts, chapters} from user-pasted cleaned text (196178 bytes, 20 chapters, 312 blocks).
- `al-bishara/tools/render_icons.mjs` — copy of barnabas script for future icon regeneration.
- Root `sw.js`: added `'al-bishara'` to `SHELLS` and `APPS`, bumped `DATA_MARKER` from `/__bookdata-v21` to `/__bookdata-v22`.
- `works/index.html` card: appended to `maktaba` (23 entries total, previously 22).
- `works/sw.js`: bumped `CACHE` to `works-v1.0.22` with al-bishara icon URLs.
- `public/al-bishara/` removed (duplicate, no references).

## Deliverables
- Live site: `https://ucfzem.github.io/al-bishara/` — returns **200**, index.html loads, icons accessible.
- Linktree card: visible on `https://ucfzem.github.io/works/` (maktaba entry 23).
- Offline capable: SW precaches core assets; root SW SHELLS includes al-bishara for offline navigation.
- Backup: `backups/al-bishara-2026-10-19/`, `backups/works-2026-10-19/`, `CONVERSATION_2026-10-19-al-bishara.md`.

## Commands run
- `git commit -m "Add al-bishara..."` (includes all above changes).
- `git push origin main`.
- Local test with Playwright: 20 chapters, 4 parts TOC, search returns results, no errors, offline renders chapter view.

## Font fix — 2026-10-19 (follow-up)
### Problem
User reported the custom Arabic fonts were not visible, unlike `https://ucfzem.github.io/rihlat-ibn-battuta/`.

### Root cause
The `<link>` to the Google Fonts stylesheet had a **typo: `rel="mediaprint"`** instead of `rel="stylesheet"`. An invalid `rel` made the browser ignore the stylesheet entirely, so `Cairo`/`Amiri` were never downloaded and the page fell back to system fonts. (The earlier commit `4ecd24f` only reordered fallback names — visually a no-op, since `Cairo` was already first.)

### Fix
1. Corrected the link to `rel="stylesheet"` and, to guarantee online **and** offline rendering:
2. **Self-hosted the fonts**: downloaded Cairo (400/700) and Amiri (400/700) `woff2` subsets (arabic, latin-ext, latin) from Google Fonts into `al-bishara/fonts/` (12 files, ~452 KB).
3. Added `al-bishara/fonts.css` with local `@font-face` rules (`unicode-range` preserved).
4. `index.html`: replaced the external Google Fonts link with `./fonts.css?v=1` (no more CDN dependency for fonts).
5. `style.css`: content font stack now byte-identical to rihlat: `'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Lateef', serif`; body: `"Cairo", "Segoe UI", "Tahoma", "Geeza Pro", "Noto Naskh Arabic", sans-serif`.
6. `sw.js`: bumped `CACHE` to `bishara-v1.0.2`, precache `fonts.css?v=1` + all 12 `woff2` files, `CDN` emptied.

### Verification (local, Playwright)
- ONLINE: `document.fonts.check('1em Cairo')` = true; all 12 faces loaded; chapter page `Amiri` = true (19 blocks).
- OFFLINE (SW controlling): Cairo = true, Amiri = true, chapter renders 19 blocks.
- Live: `fonts.css` 200, `cairo-400-arabic.woff2` 200, `amiri-400-arabic.woff2` 200; index no longer contains `mediaprint`.

### Commits
- `315c806` — Fix al-bishara fonts (rel=mediaprint typo) + self-host Cairo/Amiri woff2; precache in SW v1.0.2.