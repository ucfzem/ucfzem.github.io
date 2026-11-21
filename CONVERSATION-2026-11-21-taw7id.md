# Conversation Backup - taw7id PWA (2026-11-21)

## Scope
- Repo: `/tmp/ucfzem-site` (`ucfzem/ucfzem.github.io`, `main`, `origin/main`)
- Objective: build, integrate, debug, verify, and deploy the offline `taw7id` PWA without touching `a3lam-al-dawa`, `a3lam-al-3olama`, or uncommitted `shubuhat-wa-rudud` edits.
- Safety: no `git add -A`, no force-push, no `reset --hard`, no `clean`; stage only intended files.

## Current Deployed State
- HEAD pushed: `948fafbe97071cf3aae728ea487b47775fef6ed8` (`feat(taw7id): toggle search bar from header button`)
- Live PWA: https://ucfzem.github.io/taw7id/
- Service worker: `tawhid-book-v18`
- Search bar: hidden by default; toggled by header `🔍` button (`#btn-search-toggle`, `aria-controls="search-bar"`, `aria-expanded` updated). `/` opens search; `Escape` closes dropdown then bar.

## Files (taw7id)
- `taw7id/index.html` - RTL app shell, header controls, hidden search bar, TOC drawer, reading area, stats, quick parts, progress, scripts/SW registration hooks.
- `taw7id/manifest.json` - RTL Arabic PWA manifest, local icons, standalone.
- `taw7id/sw.js` - `CACHE_NAME='tawhid-book-v18'`; precaches index/manifest/css/js/icons/fonts.
- `taw7id/css/style.css` - local fonts, responsive layout, sticky header, static search bar, `[hidden]` handling, RTL/mobile overflow guards.
- `taw7id/js/book-data.js` - `window.BOOK_DATA` with 16 sections, 5 logical parts in section metadata, 22 `class="scholar-quote"` occurrences; no external URLs.
- `taw7id/js/app.js` - TOC/filter, search normalize/highlight/dropdown, copy actions, font/theme/last-section/stats localStorage, observer/progress, search toggle, quick-part horizontal scroll.
- `taw7id/assets/fonts/` - Amiri/Cairo Regular+Bold woff2 (local).
- `taw7id/assets/icons/` - `icon-192.png`, `icon-512.png` (local).

## Integration
- `works/index.html` - public project #22 `توحيد الربوبية وتوحيد الألوهية` linking to `https://ucfzem.github.io/taw7id/`.
- `works/Maktaba/index.html` - webapps count 7; taw7id card added with local icon `../assets/mirqat-tawhid.svg`.
- `works/assets/mirqat-tawhid.svg` reused; no unrelated entries removed.

## Key Fixes / Commits
- `c7cf432` `feat(taw7id): add offline tawhid PWA and link in works`
- `c430295` `fix(taw7id): prevent mobile horizontal overflow and overscroll bounce`
- `33f837e` `fix(taw7id): smooth-scroll freeze workaround (test1)`
- `b411b26` `fix(taw7id): test3 single scroll container and sw cache bump`
- `c008a30` `fix(taw7id): test4 restore page scroll container`
- `239e34e` `fix(taw7id): make search bar scroll with page`
- `9b74d7a` `fix(taw7id): override sticky search bar in mobile media query`
- `948fafb` `feat(taw7id): toggle search bar from header button`

## Verification (2026-11-21, latest check)
- Syntax: `node -c taw7id/js/app.js taw7id/js/book-data.js taw7id/sw.js` OK.
- Manifest JSON parse OK.
- Offline audit: no `http(s)://`/CDN in `taw7id/`; SW precache paths all exist.
- HTML IDs required by JS present (`search-bar`, `btn-search-toggle`, TOC/search/progress/stats/quick-parts ids).
- Book data: 16 sections, 22 scholar-quote class occurrences, no external URLs.
- Scroll/search audit: no touch/wheel preventDefault; `scrollIntoView` only for section jump and active search mark; search bar static/non-sticky.
- GitHub Pages probe: `https://ucfzem.github.io/taw7id/` returned HTTP 200 (headers observed).

## Known Caveats
- GitHub Pages propagation/SW cache can delay visible updates; verify with hard reload or PWA close/reopen after SW v18 activates.
- `scroll-behavior:smooth` was previously implicated in mobile freeze; current code uses `behavior:'auto'` for programmatic scrolls.
- Pre-existing local uncommitted files intentionally untouched: `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/sw.js`.

## Relevant Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Commit: https://github.com/ucfzem/ucfzem.github.io/commit/948fafbe97071cf3aae728ea487b47775fef6ed8
- Backup: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-21-taw7id.md
- Live PWA: https://ucfzem.github.io/taw7id/
- Works: https://ucfzem.github.io/works/
- Maktaba: https://ucfzem.github.io/works/Maktaba/


## Latest Verification/Deploy Check
- Re-ran syntax/JSON/offline/SW-precache/ID/content audit: all OK (`node -c` app/book-data/sw, manifest JSON, no external URLs, precache files exist, required IDs present, 16 sections/5 parts/22 scholar quotes).
- No taw7id code changes required; only backup refreshed for deployment check record.
- GitHub Pages probes: HTTP 200 for `/taw7id/`, `/works/`, `/works/Maktaba/`.
- Via vs Chrome visual difference (screenshot report): likely Via/WebView stale cache or SW old bundle; verify in Via private/incognito, clear site data for `ucfzem.github.io`, disable Via night/page scripts for test. Code audit shows `#btn-search-toggle` always present in header, no CSS hides it when search open; search bar is static and toggled by JS.


## Final Deploy Check (latest request)
- Re-ran full verification: `node -c` JS/SW OK, manifest JSON OK, no external URLs, SW precache complete, required IDs present, 16 sections/5 parts/22 scholar quotes, no external URLs in book data.
- No `taw7id` code/content changes required in this pass; only backup refreshed for traceability.
- GitHub Pages probes after push: HTTP 200 for `/taw7id/`, `/works/`, `/works/Maktaba/`.
- Working tree kept clean except pre-existing unstaged: `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/sw.js`.


## Terminology fix + redeploy
- Applied user-requested wording fix in `taw7id/js/book-data.js`: replaced `الإلهية` with preferred `الألوهية` in affected title/body lines (rububiyyah/uluhiyyah explanation section and related references).
- Re-ran verification: `node -c` app.js/book-data.js/sw.js OK, manifest JSON OK, no external URLs, SW precache complete (`tawhid-book-v18`), required IDs present, 16 sections/5 parts/22 scholar quotes, no external URLs in book data.
- Committed only intended `taw7id/` + backup, pushed `main` to `origin/main`, probed Pages 200 for `/taw7id/`, `/works/`, `/works/Maktaba/`.
- Kept `shubuhat-wa-rudud/index.html` and `shubuhat-wa-rudud/sw.js` unstaged.
