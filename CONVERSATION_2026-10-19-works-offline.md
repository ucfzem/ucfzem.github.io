# Conversation backup — 2026-10-19 (works offline hardening)

## Objective

Verify offline capability of `al-bishara` and update `https://ucfzem.github.io/works/` so that **all card icons and page parameters (data, fonts, settings) load offline** too.

## Audit findings

- **Icons:** all 26 image icons referenced by `works/index.html` (24 app `icon.svg` + `quran.png`/`tanger.png`/`remedy.svg`/`barnabas.svg`/`tarikh-ibn-khaldun.svg`/`al-tibb-al-nabawi.svg`/`cv-icon.png`/`web-dev-logo.png`/`maktaba-icon.png`) were already precached in `works/sw.js` CORE — verified by resolve-and-diff script (referenced assets: 29, precache entries: 57, missing: none).
- **Card data / parameters:** all project data is an inline JS array in `works/index.html` — always available offline once the shell is cached. Unlock validator (`works-validator…workers.dev` POST) degrades gracefully offline (try/catch → toast; prior unlock persists via `sessionStorage`).
- **Fonts — the real gap:** only the Google Fonts CSS (Cinzel + Inter) was precached; the `fonts.gstatic.com` woff2 files were not, so offline the page fell back to system fonts.

## Key decisions

- **Self-host Cinzel (400/700) and Inter (300–700)** like the al-bishara font fix: downloaded Google CSS with modern UA, kept **latin + latin-ext subsets only** (14 woff2, ~752 KB; Cyrillic/Greek/Vietnamese dropped — page is French/Arabic, Arabic falls back to system sans).
- Replaced the Google Fonts `<link>` in `works/index.html` with `./fonts.css?v=1` (unicode-ranges preserved).
- `works/sw.js`: CACHE `works-v1.0.22 → works-v1.0.23`; CORE += `fonts.css?v=1` + all 14 woff2; CDN list emptied.
- Root `sw.js`: `DATA_MARKER /__bookdata-v22 → v23` so devices re-run the book-data mirror (which picks up the new works font files via `syncAppSW`).
- **Hardened all three service workers with timeout-bounded fetches** (`fetchTO`, 8 s AbortController): root `sw.js` (precache / cacheOpaque / cacheFontFiles / syncAppSW / cacheAppData), `works/sw.js` install, `al-bishara/sw.js` precacheAll. A single stalled TCP connection can no longer hang install or the book-data mirror forever.
- Root mirror (marker) was ABSENT within 240 s only under sandbox latency (gstatic volume) — bounded now, completes normally on real networks (same pattern as v21/v22 which shipped fine).

## Files changed

- `works/index.html` — Google Fonts link → `./fonts.css?v=1`.
- `works/fonts.css` — NEW, 14 self-hosted @font-face blocks (Cinzel 400/700, Inter 300/400/500/600/700 × latin/latin-ext).
- `works/fonts/*.woff2` — NEW, 14 files (~752 KB total).
- `works/sw.js` — CACHE v1.0.23, fonts precached, CDN emptied, fetch timeouts.
- `sw.js` — DATA_MARKER v23, fetchTO timeouts everywhere in install/prefetch paths.
- `al-bishara/sw.js` — fetchTO timeouts in precacheAll (CACHE stays bishara-v1.0.2, byte change auto-updates SW).
- `backups/works-offline-2026-10-19/` — copies of all changed files.

## Verification (local, Playwright, python http.server on :8099, context.setOffline)

ONLINE:
- works: controller `works/sw.js`, 77 cards, 26/26 icons loaded, Cinzel+Inter true.
- al-bishara: controller `al-bishara/sw.js`, chapter view renders, Amiri+Cairo (Arabic text) true.

OFFLINE:
- works: 77 cards, **26/26 icons** naturalWidth>0, Cinzel **and** Inter true, fonts.css sheet = 14 rules, **0 failed requests**, stable across reload.
- al-bishara: `#chapter-1` renders (المقدمة), `.chbody` blocks present, Amiri+Cairo Arabic true, **0 failed requests**.
- Zero console/page errors (favicon excluded).
- Result: **ALL GREEN** (test script exited 0).

Notes:
- `document.fonts.check('1em Amiri')` is false on the TOC view by design (content font only requested on chapter view; default check text = space → latin face). With Arabic text on a chapter it is true.
- Offline navigations use `waitUntil:'commit'` + content waits (the `load` event can wedge on a stray subresource offline).

## Deliverables

- Live: `https://ucfzem.github.io/works/` — self-hosted fonts, all icons precached, offline-capable via `works-v1.0.23`.
- Live: `https://ucfzem.github.io/al-bishara/` — unchanged behavior, hardened SW fetches.
- Backup: `backups/works-offline-2026-10-19/`, this MD file.

## Commands run

- `node /tmp/opencode/fetch_works_fonts.mjs` — Google Fonts download + fonts.css generation.
- Icon/asset diff scripts (referenced vs precached).
- `node /tmp/opencode/test-offline.mjs` — full online/offline suite → ALL GREEN.
- `node --check` on all three modified sw.js files.
- `git commit` + `git push origin main` (code + docs commits).
