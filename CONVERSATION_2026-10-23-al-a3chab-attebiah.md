# Conversation Summary - al-a3chab-attebiah complete
---
Completed 140-entry Moroccan medicinal plants encyclopedia with full monographs, dark mode, search, safety warnings for toxic plants, and cross-references for local names.

## Fix 2026-10-23 — mobile TOC overlay bug
Symptom: selecting an index item left the sidebar pinned over the text on narrow screens.
Root cause: sidebar was `w-full` + `sticky top-24` with near-viewport height, so in the mobile flex-col layout it stayed pinned over the content.
Fix: sidebar is now `hidden md:block` (desktop unchanged), mobile gets an "open index" floating button, and the index closes automatically after selecting an entry.

## Fix 2026-10-23b — index click landed one entry below
Cause: on mobile the sidebar sits in normal flow; scrolling first and hiding it afterwards removed its height and shifted the page upward, so the viewport showed the next entry.
Fix: hide the mobile sidebar first, scroll on the next animation frame; scroll offset now uses the real header height (`--header-h`, set on load/resize/fonts-ready) instead of a fixed `scroll-mt-28`.
Verified with Playwright: mobile target top 143px vs header 125px; desktop 93px vs 75px — exact section at top on both.

## Redesign 2026-10-23c — align with risalat-ibn-fadlan
Refactored the app to mirror the reference design and features:
- Split into `index.html` + `style.css` + `app.js` + `data.js` (141 entries preserved).
- Same palette (paper/green/gold), fonts (Cairo UI + Amiri reading), sticky green header, cards, TOC grid, pager.
- Hash routing `#/read/<id>`, resume reading, copy entry, A−/A/A+ font size.
- Global instant search across titles, names and paragraphs with highlighted snippets and counts.
- In-entry search with occurrence counter, prev/next occurrence (Enter / Shift+Enter).
- PWA: `manifest.json`, `sw.js` cache (`a3chab-cache-v1.0.0`), generated 192/512 icons, offline fallback + online/offline indicator.
Tested with Playwright: 141 TOC items, global search 14 hits / 5 entries for «الشيح», reader 5 marks + counter, next/prev, font size, dark mode, SW registered, offline reload shows 141 items, no console errors, no mobile overflow.
