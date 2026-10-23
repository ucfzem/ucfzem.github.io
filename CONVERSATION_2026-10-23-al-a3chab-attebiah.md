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

## Fix 2026-10-23d — Western digits
Replaced Arabic-Indic numerals (١٢٣) with Western digits (123) for TOC numbers, entry counters, search summaries and the zero state. Bumped service worker cache to `a3chab-cache-v1.0.1`.
Verified: TOC 140, summary «14 موضعاً في 5 مدخلاً», counter «1 / 5», zero state «0 / 0».

## Update 2026-10-23e — rename + 10 new plants (150)
- Renamed the app to «المعشبة المغربية» / «موسوعة النباتات الطبية في المغرب» (title, header, manifest, works listing, footer). It is an independent compilation, not the Éditions Le Fennec book.
- Added 10 new monographs (ids 141–150): الثوم، البصل، الزعفران، الورد البلدي، الجعدة، الطيون، البرباريس، الكتان، الجلجلان، النارنج.
- Updated counts to 150 plants (151 entries incl. intro) and service worker cache to `a3chab-cache-v1.1.0`.
- Verified: 151 TOC items, last num 150, each new entry 3 paragraphs + metadata, global search «الزعفران» 4 hits, SW precache + offline reload 151 items, no mobile overflow, no JS errors.

## Safety & credibility 2026-10-23f
Response to medical-audit checklist:
- Persistent disclaimer bar under the header on every view.
- New `#/safety` page: core rules, drug-herb interactions, pregnancy/children, toxic-plant list (17 entries), local-name confusion, poisoning response.
- New `#/sources` page: honest methodology, recommended references (WHO, EMA, Moroccan pharmacopoeia, Kew POWO), and explicit statement that entries are an independent compilation without per-entry citations yet.
- Per-entry «⚠️ أبلغ عن خطأ» button opening a prefilled GitHub issue; universal safety note inside every entry card.
- A11y: aria-label on both search inputs, aria-live on the occurrence counter, labelled theme/status controls.
- Audit run: 150 plants, all have 3 paragraphs and required name fields; every known-toxic entry contains warning language; duplicate Latin names are intentional name-variant entries.
- SW cache bumped to `a3chab-cache-v1.2.0`.
Verified desktop + mobile: disclaimer, safety/sources routes, 17 toxic links, report popup, search, no overflow, no JS errors.
