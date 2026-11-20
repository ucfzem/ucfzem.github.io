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

This session added mobile navigation aids and an app-scoped offline Service Worker to `shubuhat-wa-rudud` while preserving all existing study content, search behavior, and preserved sites.

## 1. UI & Navigation Enhancements (`shubuhat-wa-rudud/index.html`)

- **Mobile quick TOC drawer (`.mobile-toc-bar`, `#mobile-toc-toggle`, `#mobile-toc-drawer`):**
  - Added a quick section index for small screens (visible at `max-width: 860px`).
  - Links to existing study sections: مقدمة منهجية, أجزاء ١–٨, ومناظرة الإمام الشافعي.
  - Drawer toggles via `aria-expanded`/`[hidden]` and **auto-closes** when any `.mobile-toc-link` is selected.
- **Back-to-top button (`#back-to-top-btn`, `.back-to-top-btn`):**
  - Fixed button that becomes visible after scrolling (`scrollY > 360px`, `.is-visible`).
  - Smooth scroll to top with fallback (`window.scrollTo(0, 0)`).
- **Styling:** Added responsive/mobile-compatible CSS for the quick TOC bar/drawer and back-to-top control without altering existing header/content behavior.

## 2. Offline / Caching (`shubuhat-wa-rudud/sw.js`)

- **New app-scoped Service Worker:** `shubuhat-wa-rudud/sw.js`
  - Versioned caches: `shubuhat-wa-rudud-v2026-11-20-static` and `-runtime`.
  - **Precache:** `./`, `./index.html`, `./icon.svg`.
  - **Lifecycle:** `install` precaches and `skipWaiting()`; `activate` cleans outdated caches and calls `clients.claim()`.
  - **Fetch strategy:**
    - Navigate requests: **Network First** with cache fallback (`./index.html` / `./`) for updates when online and offline access when needed.
    - Same-origin GET assets: **Cache First** with safe runtime caching of basic OK responses.
    - Cross-origin GET (e.g. fonts): **Network First** with cache fallback, without breaking browsing on failure.
- **Registration:** Added `navigator.serviceWorker.register('./sw.js')` on page load in `shubuhat-wa-rudud/index.html`.

## 3. Works SW Cache Version Bumps (maintenance)

- `works/sw.js`: bumped cache `maktaba-v16` → `maktaba-v17` (icon precache retained).
- `works/Maktaba/sw.js`: bumped cache `maktaba-main-v7` → `maktaba-main-v8` (EXTERNAL/icon precache retained).

## 4. Safety / Verification Notes

- Changes were additive and limited to: `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/sw.js`, `works/sw.js`, `works/Maktaba/sw.js`, and this backup file.
- Preserved apps/pages were not modified: `a3lam-al-dawa`, `a3lam-al-3olama`, `works/Maktaba` library content/rows, and other existing works entries.
- Existing in-app live search implementation (`#liveSearchInput`, `#searchMatchCount`, `#reviewMain`, `mark.hit-mark`/`active-hit`, hit navigation/counters) and TOC/scroll tracking were left intact.

## 5. Pre-Deploy / Follow-up Checklist

- On future content or asset changes to `shubuhat-wa-rudud`, bump `CACHE_VERSION` in `shubuhat-wa-rudud/sw.js` and add any new local assets/fonts to `PRECACHE_URLS` as needed.
- If additional user-provided study sections (e.g. شبكة القراءة `#shubha-vs-radd-grid`, تصنيف الاتجاهات/بطاقات العلماء `#extra-categories-profiles`, مقارنة النقد والطعن `#critique-vs-attack`, filter/search normalization variants) are to be integrated, add them as compatible `section-card` blocks with TOC/search tracking hooks and reconcile any differing element IDs/classes with the existing implementation before publishing.
