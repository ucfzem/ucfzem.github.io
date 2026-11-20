# CONVERSATION-2026-11-20-shubuhat-wa-rudud.md

## Metadata
- **Project:** `shubuhat-wa-rudud`
- **Repository:** `ucfzem/ucfzem.github.io` (branch: `main`)
- **Live URL:** https://ucfzem.github.io/shubuhat-wa-rudud/
- **Related Pages:** https://ucfzem.github.io/works/ · https://ucfzem.github.io/works/Maktaba/
- **Preserved Pages:** https://ucfzem.github.io/a3lam-al-dawa/ · https://ucfzem.github.io/a3lam-al-3olama/ · https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- **Date:** 2026-11-20

---

## Session Summary

This session enhanced `shubuhat-wa-rudud` additively with mobile navigation, an app-scoped offline Service Worker, integrated user-provided methodological/reference sections, and follow-up mobile/RTL layout fixes while preserving all existing study content, search behavior, and preserved sites.

## 1. UI & Navigation Enhancements (`shubuhat-wa-rudud/index.html`)

- **Mobile quick TOC drawer (`.mobile-toc-bar`, `#mobile-toc-toggle`, `#mobile-toc-drawer`):**
  - Quick section index for small screens (visible at `max-width: 860px`).
  - Links to existing and newly added study sections.
  - Drawer toggles via `aria-expanded`/`[hidden]` and **auto-closes** when any `.mobile-toc-link` is selected.
- **Back-to-top button (`#back-to-top-btn`, `.back-to-top-btn`):**
  - Fixed button visible after scrolling (`scrollY > 360px`, `.is-visible`).
  - Smooth scroll to top with fallback (`window.scrollTo(0, 0)`).

## 2. Integrated Additive Study Sections (before `part-8`)

All added as searchable/trackable `section-card study-section` blocks with TOC (sidebar + mobile drawer) entries and scroll-tracking compatibility:

- **`#shubha-vs-radd-grid` — شبكة القراءة المنهجية: الشبهة مقابل الرد** (4-step methodological grid).
- **`#critique-vs-attack` — الفرق بين النقد العلمي المنضبط والطعن المبتدع** (comparison table + practical callout note).
- **`#detailed-shubuhat-table` — تفكيك الشبهات وتعيين قائليها والرد عليها** (matrix table: proponents, claims, responses, sources).
- **`#extra-categories-profiles` — تصنيف الاتجاهات وبطاقات إضافية (الشبهات والعلماء)** with filter bar (`data-filter="all|shubha-trend|scholars-classic|scholars-modern"`), trend cards, and scholar/researcher profiles.

## 3. Search, Styling & Scripting

- **Live search indexing extended** (existing implementation preserved: `#liveSearchInput`, `#searchMatchCount`, hit navigation/counters, `mark.hit-mark`/`active-hit`, Arabic normalization/highlighting logic): `collectTextNodes()` also scans `.comparison-table td/th`, `.shubuhat-matrix-table td/th`, `.grid-card`, `.profile-card`, `.callout-note`, `.section-intro`.
- **CSS:** Styles for `.study-section`, grid/cards/badges, filter bar, comparison/matrix tables, callout, responsive adjustments, and profile-card filter visibility.
- **Filter JS:** Inline script for profile category filtering (active state + show/hide by `data-category`).

## 4. Mobile/RTL Overflow & Layout Polish (follow-up)

- Added targeted fixes to prevent horizontal clipping and improve narrow-screen behavior: `html/body` `max-width: 100%` with `overflow-x: clip` (and hidden fallback), `min-width: 0`/`max-width: 100%` on key layout containers, `.table-wrap` horizontal scrolling (`overflow-x: auto`, touch scrolling) for new comparison/matrix tables, safe wrapping for `.toc-btn` and mobile TOC links, and constrained mobile sidebar drawer width/overflow (`max-width: 92vw`, overflow handling).

## 5. Offline / Caching

- **App-scoped Service Worker:** `shubuhat-wa-rudud/sw.js`
  - Versioned caches: `shubuhat-wa-rudud-v2026-11-20c-static` and `-runtime` (bumped after CSS/content/layout updates).
  - **Precache:** `./`, `./index.html`, `./icon.svg`.
  - **Lifecycle:** `install` precaches and `skipWaiting()`; `activate` cleans outdated caches and calls `clients.claim()`.
  - **Fetch strategy:** Navigate requests **Network First** with cache fallback; same-origin GET **Cache First** with safe runtime caching; cross-origin GET **Network First** with cache fallback.
  - Registered on page load via `navigator.serviceWorker.register('./sw.js')`.
- **Works SW cache bumps (maintenance):** `works/sw.js` `maktaba-v16` → `maktaba-v17`; `works/Maktaba/sw.js` `maktaba-main-v7` → `maktaba-main-v8` (icon precaches retained).

## 6. Safety / Verification Notes

- Changes were additive and limited to: `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/sw.js`, `works/sw.js`, `works/Maktaba/sw.js`, and this backup file.
- Preserved apps/pages were not modified: `a3lam-al-dawa`, `a3lam-al-3olama`, `works/Maktaba` library content/rows, and other existing works entries.
- Existing TOC/scroll tracking, theme/font/size/last-part persistence, and in-app live search behavior/IDs were preserved.

## 7. Pre-Deploy / Follow-up Checklist

- On future content or asset changes to `shubuhat-wa-rudud`, bump `CACHE_VERSION` in `shubuhat-wa-rudud/sw.js` and add any new local assets/fonts to `PRECACHE_URLS` as needed.
- Verify on GitHub Pages/mobile: drawer/sidebar behavior, no horizontal overflow/clipping, table scroll within `.table-wrap`, filter+search interaction, and offline reload with updated SW.
