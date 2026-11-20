# CONVERSATION-2026-11-20-shubuhat-wa-rudud.md

## Metadata
- **Project:** `shubuhat-wa-rudud`
- **Repository:** `ucfzem/ucfzem.github.io` (branch: `main`)
- **Live URL:** https://ucfzem.github.io/shubuhat-wa-rudud/
- **Related Pages:** https://ucfzem.github.io/works/ · https://ucfzem.github.io/works/Maktaba/
- **Preserved Pages:** https://ucfzem.github.io/a3lam-al-dawa/ · https://ucfzem.github.io/a3lam-al-3olama/ · https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- **Date:** 2026-11-20
- **HEAD:** `16e3694`

---

## Session Summary

This session enhanced `shubuhat-wa-rudud` additively with mobile navigation, an app-scoped offline Service Worker, integrated user-provided methodological/reference sections, mobile/RTL layout fixes, and a follow-up scholarly expansion on hadith methodology and early tadwin—while preserving all existing study content, search behavior, and preserved sites.

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

## 3. Hadith Methodology & Early Tadwin Expansion (follow-up)

- **`part-4` — منزلة الإسناد وعلم الجرح والتعديل:** expanded into “منهج المحدثين في نقد الأخبار” with structured cards covering **نقد السند** (اتصال السند، عدالة الرواة، ضبط الرواة) and **نقد المتن** (عدم الشذوذ، انتفاء العلة القادحة) plus notes on علم الرجال والتوثيق المزدوج (السماع المتصل والإسناد مع حفظ الصدور والكتب).
- **`part-3` — سادسًا (شبهة «السنة لم تُدوّن إلا متأخرًا»):** enriched answer clarifying الخلط بين الكتابة الفردية المبكرة والتصنيف الرسمي الجامع، مع أمثلة (الصحيفة الصادقة، صحيفة علي، صحيفة همام بن منبه، صحيفة جابر، وكتب النبي ﷺ الرسمية)، وفهم حديث النهي عن الكتابة كتظيم مرحلي، والتوثيق المزدوج.
- **`part-3` — سابعًا (new subsection): “منهج المحدثين في النقد، وصحف التدوين المبكر، والرد على شبهات منكري السنة”** including:
  - أمثلة على صحف الصحابة والتدوين المبكر (الصحيفة الصادقة لعبد الله بن عمرو رضي الله عنهما، صحيفة علي، صحيفة همام بن منبه عن أبي هريرة، صحيفة جابر، والكتب/الوثائق الرسمية النبوية).
  - الرد على شبهة «تأخر تدوين السنة» (الكتابة الفردية مقابل التصنيف الرسمي/الجمع والتبويب في القرن الثاني، فهم حديث النهي، والتوثيق المزدوج).
  - جدول «أبرز شبهات منكري السنة والردود العلمية عليها» (القرآن يكفينا وحده، كُتبت بعد النبي ﷺ بمدة طويلة، وجود أحاديث مكذوبة وموضوعة، وجود تعارض ظاهري) مع خلاصة منهجية.
- **`#detailed-shubuhat-table`:** first-row response (إنكار السنة التشريعية) refined to reflect early tadwin examples and that حفظ/نقد السنة سبقا الجمع في الأبواب.

## 4. Search, Styling & Scripting

- **Live search indexing extended** (existing implementation preserved: `#liveSearchInput`, `#searchMatchCount`, hit navigation/counters, `mark.hit-mark`/`active-hit`, Arabic normalization/highlighting logic): `collectTextNodes()` also scans `.comparison-table td/th`, `.shubuhat-matrix-table td/th`, `.grid-card`, `.profile-card`, `.callout-note`, `.section-intro`.
- **CSS:** Styles for `.study-section`, grid/cards/badges, filter bar, comparison/matrix tables, callout, responsive adjustments, profile-card filter visibility, and mobile/RTL overflow guards.
- **Filter JS:** Inline script for profile category filtering (active state + show/hide by `data-category`).

## 5. Mobile/RTL Overflow & Layout Polish

- Targeted fixes to prevent horizontal clipping and improve narrow-screen behavior: `html/body` `max-width: 100%` with `overflow-x: clip` (and hidden fallback), `min-width: 0`/`max-width: 100%` on key layout containers, `.table-wrap` horizontal scrolling (`overflow-x: auto`, touch scrolling) for comparison/matrix tables, safe wrapping for `.toc-btn` and mobile TOC links, and constrained mobile sidebar drawer width/overflow (`max-width: 92vw`, overflow handling).

## 6. Offline / Caching

- **App-scoped Service Worker:** `shubuhat-wa-rudud/sw.js`
  - **`CACHE_VERSION`:** `shubuhat-wa-rudud-v2026-11-20d` (`-static` / `-runtime`).
  - **Precache:** `./`, `./index.html`, `./icon.svg`.
  - **Lifecycle:** `install` precaches and `skipWaiting()`; `activate` cleans outdated caches and calls `clients.claim()`.
  - **Fetch strategy:** Navigate requests **Network First** with cache fallback; same-origin GET **Cache First** with safe runtime caching; cross-origin GET **Network First** with cache fallback.
  - Registered on page load via `navigator.serviceWorker.register('./sw.js')`.
- **Works SW cache bumps (maintenance):** `works/sw.js` `maktaba-v16` → `maktaba-v17`; `works/Maktaba/sw.js` `maktaba-main-v7` → `maktaba-main-v8` (icon precaches retained).

## 7. Safety / Verification Notes

- Changes were additive and limited to `shubuhat-wa-rudud` content/UI/SW and works SW cache maintenance; no destructive operations used.
- Preserved apps/pages were not modified: `a3lam-al-dawa`, `a3lam-al-3olama`, `works/Maktaba` library content/rows, and other existing works entries.
- Existing TOC/scroll tracking, theme/font/size/last-part persistence, and in-app live search behavior/IDs were preserved.
- On future content or asset changes to `shubuhat-wa-rudud`, bump `CACHE_VERSION` in `shubuhat-wa-rudud/sw.js` and add any new local assets/fonts to `PRECACHE_URLS` as needed.
- Verify on GitHub Pages/mobile: drawer/sidebar behavior, no horizontal overflow/clipping, table scroll within `.table-wrap`, filter+search interaction, and offline reload with updated SW.

## 8. Commits (this session, latest relevant)

- `566cac9` — `feat(shubuhat-wa-rudud): add mobile quick TOC, back-to-top, and service worker`
- `321aa9d` — `feat(shubuhat-wa-rudud): add reading grid, critique comparison, shubuhat matrix, and filtered profiles`
- `9dc6732` — `fix(shubuhat-wa-rudud): improve mobile/RTL overflow handling and table-wrap scrolling`
- `16e3694` — `feat(shubuhat-wa-rudud): expand hadith methodology and early tadwin responses` (HEAD)

## 9. Links

- **Repository:** https://github.com/ucfzem/ucfzem.github.io
- **Live app:** https://ucfzem.github.io/shubuhat-wa-rudud/
- **Works:** https://ucfzem.github.io/works/ · https://ucfzem.github.io/works/Maktaba/
- **Backup (this file):** https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-20-shubuhat-wa-rudud.md
- **Prior backup:** https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-shubuhat-wa-rudud.md
- **Key commits:** https://github.com/ucfzem/ucfzem.github.io/commit/566cac9 · https://github.com/ucfzem/ucfzem.github.io/commit/321aa9d · https://github.com/ucfzem/ucfzem.github.io/commit/9dc6732 · https://github.com/ucfzem/ucfzem.github.io/commit/16e3694
- **Preserved:** https://ucfzem.github.io/a3lam-al-dawa/ · https://ucfzem.github.io/a3lam-al-3olama/ · https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
