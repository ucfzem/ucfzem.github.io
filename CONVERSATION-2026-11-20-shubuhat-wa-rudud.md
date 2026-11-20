# CONVERSATION-2026-11-20-shubuhat-wa-rudud.md

## Metadata
- **Project:** `shubuhat-wa-rudud`
- **Repository:** `ucfzem/ucfzem.github.io` (branch: `main`)
- **Live URL:** https://ucfzem.github.io/shubuhat-wa-rudud/
- **Related Pages:** https://ucfzem.github.io/works/ · https://ucfzem.github.io/works/Maktaba/
- **Preserved Pages:** https://ucfzem.github.io/a3lam-al-dawa/ · https://ucfzem.github.io/a3lam-al-3olama/ · https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- **Date:** 2026-11-20
- **Latest feature commit:** `4465915`

---

## Session Summary

This session enhanced `shubuhat-wa-rudud` additively with mobile navigation, an app-scoped offline Service Worker, integrated methodological/reference sections, mobile/RTL layout fixes, expanded hadith-methodology/early-tadwin content, an in-page early-suhuf guide with CTAs/TOC links, and header/app icon updates—while preserving all existing study content, search behavior, and preserved sites.

## 1. UI & Navigation Enhancements (`shubuhat-wa-rudud/index.html`)

- **Mobile quick TOC drawer (`.mobile-toc-bar`, `#mobile-toc-toggle`, `#mobile-toc-drawer`):**
  - Quick section index for small screens (visible at `max-width: 860px`).
  - Links to existing and newly added study sections.
  - Drawer toggles via `aria-expanded`/`[hidden]` and **auto-closes** when any `.mobile-toc-link` is selected.
- **Back-to-top button (`#back-to-top-btn`, `.back-to-top-btn`):**
  - Fixed button visible after scrolling (`scrollY > 360px`, `.is-visible`).
  - Smooth scroll to top with fallback (`window.scrollTo(0, 0)`).
- **Header brand mark:** replaced the inline decorative SVG with the app icon `<img src="./icon.svg" alt="" class="brand-icon" width="38" height="38" aria-hidden="true" decoding="async" />` (responsive `.brand-icon` sizing: `38x38`, `max-width:100%`, `min-width:0`, no overflow) while keeping surrounding layout, titles, dark/gold theme, and header controls intact.

## 2. Integrated Additive Study Sections

All added/present as searchable/trackable `section-card study-section` blocks with TOC (sidebar + mobile drawer) entries and scroll-tracking compatibility:

- **`#shubha-vs-radd-grid` — شبكة القراءة المنهجية: الشبهة مقابل الرد** (4-step methodological grid).
- **`#critique-vs-attack` — الفرق بين النقد العلمي المنضبط والطعن المبتدع** (comparison table + practical callout note).
- **`#detailed-shubuhat-table` — تفكيك الشبهات وتعيين قائليها والرد عليها** (matrix table: proponents, claims, responses, sources) with in-cell CTA to early-suhuf guide.
- **`#early-suhuf-guide` — دليل الصحف الحديثية المبكرة: عرض مفصّل لإزالة شبهة تأخر التدوين** (in-page, offline/search-friendly): four detailed cards (الصحيفة الصادقة، صحيفة همام بن منبه، صحيفة علي، صحيفة/مرويات جابر رضي الله عنهم) each covering صاحبها وراويها، مضمونها وأمثلة، كيف وصلت إلينا، وكيف تردّ على شبهة تأخر التدوين، plus methodological conclusion and reading guidance. Linked from part-3 (سابعًا/أمثلة الصحف) and detailed-shubuhat-table via `.sahifa-cta-box` buttons, and from sidebar/mobile TOC.
- **`#extra-categories-profiles` — تصنيف الاتجاهات وبطاقات إضافية (الشبهات والعلماء)** with filter bar (`data-filter="all|shubha-trend|scholars-classic|scholars-modern"`), trend cards, and scholar/researcher profiles.

## 3. Hadith Methodology & Early Tadwin Expansion

- **`part-4` — منزلة الإسناد وعلم الجرح والتعديل:** expanded into “منهج المحدثين في نقد الأخبار” with structured cards covering **نقد السند** (اتصال السند، عدالة الرواة، ضبط الرواة) and **نقد المتن** (عدم الشذوذ، انتفاء العلة القادحة) plus notes on علم الرجال والتوثيق المزدوج (السماع المتصل والإسناد مع حفظ الصدور والكتب).
- **`part-3` — سادسًا (شبهة «السنة لم تُدوّن إلا متأخرًا»):** enriched answer clarifying الخلط بين الكتابة الفردية المبكرة والتصنيف الرسمي الجامع، مع أمثلة (الصحيفة الصادقة، صحيفة علي، صحيفة همام بن منبه، صحيفة جابر، وكتب النبي ﷺ الرسمية)، وفهم حديث النهي عن الكتابة كتظيم مرحلي، والتوثيق المزدوج.
- **`part-3` — سابعًا (subsection): “منهج المحدثين في النقد، وصحف التدوين المبكر، والرد على شبهات منكري السنة”** including أمثلة على صحف الصحابة والتدوين المبكر، الرد على شبهة «تأخر تدوين السنة»، جدول «أبرز شبهات منكري السنة والردود العلمية عليها»، وخلاصة منهجية، مع زر انتقال داخلي إلى `#early-suhuf-guide`.
- **`#detailed-shubuhat-table`:** first-row response (إنكار السنة التشريعية) refined to reflect early tadwin examples and that حفظ/نقد السنة سبقا الجمع في الأبواب, with CTA link to `#early-suhuf-guide`.

## 4. Search, Styling & Scripting

- **Live search indexing extended** (existing implementation preserved: `#liveSearchInput`, `#searchMatchCount`, hit navigation/counters, `mark.hit-mark`/`active-hit`, Arabic normalization/highlighting logic): `collectTextNodes()` also scans `.comparison-table td/th`, `.shubuhat-matrix-table td/th`, `.grid-card`, `.profile-card`, `.callout-note`, `.section-intro`.
- **CSS:** Styles for `.study-section`, grid/cards/badges, filter bar, comparison/matrix tables, callout, sahifa CTA/detail cards/grid, responsive adjustments, profile-card filter visibility, and mobile/RTL overflow guards.
- **Filter JS:** Inline script for profile category filtering (active state + show/hide by `data-category`).

## 5. Mobile/RTL Overflow & Layout Polish

- Targeted fixes to prevent horizontal clipping and improve narrow-screen behavior: `html/body` `max-width: 100%` with `overflow-x: clip` (and hidden fallback), `min-width: 0`/`max-width: 100%` on key layout containers, `.table-wrap` horizontal scrolling (`overflow-x: auto`, touch scrolling) for comparison/matrix tables, safe wrapping for `.toc-btn` and mobile TOC links, and constrained mobile sidebar drawer width/overflow (`max-width: 92vw`, overflow handling).

## 6. Offline / Caching & Icons

- **App-scoped Service Worker:** `shubuhat-wa-rudud/sw.js`
  - **`CACHE_VERSION`:** `shubuhat-wa-rudud-v2026-11-20g` (`-static` / `-runtime`).
  - **Precache:** `./`, `./index.html`, `./icon.svg`, `./icon.png`.
  - **Lifecycle:** `install` precaches and `skipWaiting()`; `activate` cleans outdated caches and calls `clients.claim()`.
  - **Fetch strategy:** Navigate requests **Network First** with cache fallback; same-origin GET **Cache First** with safe runtime caching; cross-origin GET **Network First** with cache fallback.
  - Registered on page load via `navigator.serviceWorker.register('./sw.js')`.
- **Icons (scoped to app):** `shubuhat-wa-rudud/icon.svg` retained as header brand mark; `shubuhat-wa-rudud/icon.png` added and used as favicon/apple-touch-icon.

## 7. Safety / Verification Notes

- Changes in latest feature commit were additive and scoped to `shubuhat-wa-rudud/` (`index.html`, `sw.js`, `icon.png`) and this backup; no destructive operations used.
- Preserved apps/pages were not modified: `a3lam-al-dawa`, `a3lam-al-3olama`, `works/`, `works/Maktaba` library content/rows, and other existing works entries.
- Existing TOC/scroll tracking, theme/font/size/last-part persistence, and in-app live search behavior/IDs were preserved.
- On future content or asset changes to `shubuhat-wa-rudud`, bump `CACHE_VERSION` in `shubuhat-wa-rudud/sw.js` and add any new local assets/fonts to `PRECACHE_URLS` as needed.
- Verify on GitHub Pages/mobile: header icon rendering, drawer/sidebar behavior and CTA jumps to `#early-suhuf-guide`, no horizontal overflow/clipping, table scroll within `.table-wrap`, filter+search interaction, and offline reload with updated SW.

## 8. Commits (this session, latest relevant)

- `566cac9` — `feat(shubuhat-wa-rudud): add mobile quick TOC, back-to-top, and service worker`
- `321aa9d` — `feat(shubuhat-wa-rudud): add reading grid, critique comparison, shubuhat matrix, and filtered profiles`
- `9dc6732` — `fix(shubuhat-wa-rudud): improve mobile/RTL overflow handling and table-wrap scrolling`
- `16e3694` — `feat(shubuhat-wa-rudud): expand hadith methodology and early tadwin responses`
- `7da0821` — `docs: update shubuhat-wa-rudud session backup`
- `4465915` — `feat(shubuhat-wa-rudud): add early suhuf guide, CTAs, and header icon updates` (latest feature)

## 9. Links

- **Repository:** https://github.com/ucfzem/ucfzem.github.io
- **Live app:** https://ucfzem.github.io/shubuhat-wa-rudud/
- **Works:** https://ucfzem.github.io/works/ · https://ucfzem.github.io/works/Maktaba/
- **Backup (this file):** https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-20-shubuhat-wa-rudud.md
- **Prior backup:** https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-shubuhat-wa-rudud.md
- **Key commits:** https://github.com/ucfzem/ucfzem.github.io/commit/566cac9 · https://github.com/ucfzem/ucfzem.github.io/commit/321aa9d · https://github.com/ucfzem/ucfzem.github.io/commit/9dc6732 · https://github.com/ucfzem/ucfzem.github.io/commit/16e3694 · https://github.com/ucfzem/ucfzem.github.io/commit/7da0821 · https://github.com/ucfzem/ucfzem.github.io/commit/4465915
- **Preserved:** https://ucfzem.github.io/a3lam-al-dawa/ · https://ucfzem.github.io/a3lam-al-3olama/ · https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
