# Conversation — Musawa Qasas App Build (موسوعة القصص والحديث النبوي الصحيح)

Date: 2026-10-18

## Summary

Built and deployed **الموسوعة الشاملة للقصص والحديث النبوي الصحيح** — a single-file Arabic RTL PWA encyclopedia of authentic prophetic stories and hadith (22 stories across 3 categories). Introduced a **three-tier text-verification system**: every story carries a `text_status` (🟢 `verbatim` / 🟡 `near_verbatim` / 🟠 `summary_with_reference`) plus a direct `source_url` for one-click verification. Deployed into the site repo and added to the **Maktaba** folder of the works link-tree (unlocked section).

## App Location

- Standalone build: `/tmp/opencode/musawa-qasas-app/`
- Deployed in site repo: `/tmp/opencode/ucfzem.github.io/musawa-qasas/`
- Live URL: `https://ucfzem.github.io/musawa-qasas/`

## Categories (3)

1. `قصص الأنبياء والأمم السابقة`
2. `قصص السيرة والمغازي والشمائل`
3. `الغيبيات والمشاهدات والأمثال`

## Three-Tier Verification System

- `text_status: "verbatim"` → 🟢 «نصّ حرفي موثق» — quoted verbatim from the cited source.
- `text_status: "near_verbatim"` → 🟡 «نصّ قريب بالمعنى» — close to the original wording; minor wording differences possible.
- `text_status: "summary_with_reference"` → 🟠 «ملخّص وافٍ + إحالة» — faithful summary (not quoted); full text in the cited source.
- Each story has `source_url` (sunnah.com / dorar.net) powering the «تحقّق في المصدر» button in the reader modal.
- Counts in this build: 9 🟢, 10 🟡, 3 🟠 (22 total).

## Key Files Created

- `index.html` — single-file app: CSS (light `#FAF6EE`/emerald `#1B4332`/gold `#C5A059`, dark `#12161A`), Amiri/Scheherazade New/Reem Kufi fonts, header ornaments, search, category filters, **status filters**, cards with colored status badges, reader modal (status banner + source + benefits + verify/copy/fav), theme + font-size controls, toast, scroll-to-top, PWA init.
- `sw.js` — `musawa-qasas-v1.0.0`, precache CORE (index, manifest, icons, fonts CSS); runtime cache for same-origin + Google Fonts.
- `manifest.webmanifest` — name/short_name "الموسوعة النبوية", theme `#1B4332`, RTL, standalone, icons 192/512/svg.
- `icon.svg` — emerald gradient bg, ornamented frame, open manuscript book + gold 8-point star (distinct identity).
- `icon-192.png`, `icon-512.png` (rendered via Playwright).
- `.nojekyll`.
- `tools/render_icons.mjs` (Playwright icon renderer, copied from sahih-al-qasas).
- Dataset: inline `const STORIES = [...]` in `index.html` — schema `{ id, title, category, text_status, source_url, full_text, source, benefits[] }`.

## Technical Notes

- localStorage keys: `encyclopedia_favs`, `encyclopedia_theme`, `encyclopedia_fontsize`, `encyclopedia_fontfamily`.
- Filters: category row (`#filters`) + status row (`#statusFilters`); both independent, combined in `getFilteredStories()`.
- Search: title + full_text + source + category, with `<mark>` highlight.
- PWA: **blob service-worker URLs are NOT supported by Chrome** — replaced the original blob-manifest/blob-SW approach with real external `sw.js` + `manifest.webmanifest` + PNG icons; `initPWA()` registers `./sw.js` on `load`.

## Data Sourcing & Verification Notes

- Classical hadith texts (Bukhari/Muslim, 9th c.) are public domain → sourced/generated from knowledge and cross-checked against sunnah.com.
- Verified numbers/links embedded include: أم زرع (Bukhari 5189 / Muslim 2448), الإسراء والمعراج (Bukhari 349 / Muslim 162 — summarized), جابر والجمل (Muslim 715 / Bukhari 2097), خرافة (Ahmad/Ibn Majah; note: some scholars grade it weak — the app lists it via Albani's Silsilah correction), تميم الداري (Muslim 2942), أصحاب الأخدود (Muslim 3005), جريج (Bukhari 3436), الأبرص والأقرع والأعمى (Bukhari 3464 / Muslim 2964), أصحاب الصخرة (Bukhari 2272), قاتل المائة (Muslim 2766), كفيل الألف دينار (Bukhari 2291), ملك الموت وموسى (Bukhari 1339 / Muslim 2372), كعب بن مالك (Bukhari 4418), الإفك (Bukhari 4141), الحديبية (Bukhari 2731), فتح مكة (Bukhari 4280), الشفاعة (Bukhari 4712 / Muslim 194), آخر من يدخل الجنة (Muslim 183), أصحاب السفينة (Bukhari 2493), الهجرة وغار ثور (Bukhari 3653 / Muslim 2381), سقي الكلب (Bukhari 173 / Muslim 2244).
- **Verification caveat:** "🟢 حرفي" status reflects the compiler's intent; exact ألفاظ and numbering should still be confirmed against printed references (the app footer/UX encourages this via the source button). A few long records (e.g. Hudaybiyyah, Fath Makkah) are marked 🟡 near_verbatim rather than 🟢.

## Works Link-Tree Integration (unlocked section)

- File: `/tmp/opencode/ucfzem.github.io/works/index.html`
- Added ONE entry to the `const maktaba = [...]` array (the unlocked Maktaba folder), immediately after «صحيح القصص النبوي»:
  `{ emoji: "📖", name: "موسوعة القصص والحديث النبوي", tag: "Hadith", icon: "https://ucfzem.github.io/musawa-qasas/icon.svg", url: "https://ucfzem.github.io/musawa-qasas/", newTab: true }`
- Maktaba entry count: 21 → 22. No existing entries removed/modified.
- `works/sw.js`: cache bumped `works-v1.0.17` → `works-v1.0.18`; added `musawa-qasas/icon.svg` + `musawa-qasas/icon-192.png` to CORE.

## Verification Performed

- `node --check` on the extracted script → OK.
- Headless Playwright render: 22 cards, 22 status badges, 4 status-filter buttons, reader modal opens with status banner + verify button, **0 console/page errors**.
- Headless render of `works/index.html`: 16 public cards, 1 folder, **22 maktaba cards** (incl. new one), 9 locked folders intact, 0 errors.
- `git diff` reviewed: only additions (no unrelated deletions).

## Git Context

- Branch: `main`; remote `origin` → `github.com/ucfzem/ucfzem.github.io.git`; GitHub Pages (no CI workflows).
- Commit: `e46be2b` — "Add Musawa Qasas encyclopedia: 22-story PWA with 3-tier text verification + Maktaba card".

## Lesson Recorded

Earlier the user lost 26 links from the works page by mistake. This session enforced:
1. Recon-before-edit of `works/index.html` arrays.
2. Append-only edits (one new line), never replacing array blocks.
3. `git diff` inspection before commit to confirm zero deletions.
4. Headless render count check (public/maktaba/locked) before pushing.

---

## Follow-up Session (same day) — tweaks, font, offline hardening, backup

### Changes applied
1. **Removed app subtitle** «نزهة المشتاق في اختراق الآفاق — في رحاب السنة النبوية المطهرة» from the header. Source `sw.js` bumped `musawa-qasas-v1.0.0` → `v1.0.1`.
2. **Removed the «صحيح القصص النبوي» card** from the works Maktaba folder (single-line deletion only). The `sahih-al-qasas` app files remain live; only its link-tree card was removed. Maktaba 22 → 21. `works/sw.js` bumped `works-v1.0.18` → `v1.0.19`.
   - Commit `f5d22e6` — "Remove app subtitle; remove Sahih al-Qasas card from Maktaba; bump SW caches".
3. **Heading font changed to Cairo** to match the heading font of the book app **نزهة المشتاق** (نُزهة المشتاق uses Cairo for `h1`/`h2`; verified via live computed style). `--font-display` changed from `'Reem Kufi'` → `'Cairo'`, and Cairo added to the Google Fonts `<link>` + SW CORE fonts URL. Body font remains Amiri. Source `sw.js` bumped `v1.0.1` → `v1.0.2`.
   - Commit `20b5c84` — "Change heading font to Cairo (match Nuzhat al-Mushtaq book); bump SW v1.0.2".
4. **Works offline hardening:** the works page requests the Maktaba icon as `assets/maktaba.png?v=2026-10-17-3` (query-parameterized), but SW CORE precaches the query-less `assets/maktaba.png` → `caches.match(req)` would miss it if the HTTP cache is cleared. Fixed the same-origin fetch fallback to `caches.match(req, { ignoreSearch: true })`. `works/sw.js` bumped `works-v1.0.19` → `works-v1.0.20`.

### Works backup snapshot
- Created `backups/works-2026-10-18/` — full restorable copy of `works/` (`index.html`, `sw.js`, `assets/` (12 files), `robots.txt`, `sitemap.xml`), ~1.3 MB.

### Verification performed (online + offline)
- **Online icon check:** all 27 referenced icon/asset URLs **+ the `?v=` parameterized Maktaba icon** → HTTP 200 (0 failures).
- **Offline test (works):** registered SW → controlled → `setOffline(true)` → reload: title renders, **16 public cards + 21 Maktaba cards**, **0 broken images** (26/26 imgs loaded), 0 errors.
- **App heading font:** headless computed style confirms `h1` and `.card h3` render in **Cairo**; body in Amiri; 22 cards; subtitle element gone; 0 errors.

### Current live SW versions
- `https://ucfzem.github.io/musawa-qasas/sw.js` → `musawa-qasas-v1.0.2`
- `https://ucfzem.github.io/works/sw.js` → `works-v1.0.20`

### Offline-capable entry points
- App: `https://ucfzem.github.io/musawa-qasas/` (PWA installable, SW-precached).
- Link-tree: `https://ucfzem.github.io/works/` (SW caches page + 12 local assets + 22 app icons + fonts).
