# Conversation Backup — Maktaba Offline Support

**Date:** 2026-11-14
**Task:** Test offline functionality of the Maktaba page and every webapp linked from it, then fix any failures.

## Scope

- Maktaba main: https://ucfzem.github.io/works/Maktaba/
- Cloudflare proxy: https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/
- Maktaba library: https://ucfzem.github.io/works/Maktaba/library/
- 31 library app URLs in `works/Maktaba/library/index.html`
- Main-page webapps: Quran Majeed v3, Tanger d'Antan, Mapamundi

## Findings

- Maktaba main had no service worker registration. Offline reload failed with `net::ERR_INTERNET_DISCONNECTED`.
- `works/sw.js` deliberately ignores `/works/Maktaba` navigations, so the Works service worker could not cover it.
- Maktaba library already worked offline via `works/Maktaba/library/sw.js`.
- All 31 library apps worked offline after an online load, except `al-ajwiba-al-musaddada`.
- `al-ajwiba-al-musaddada` registered its service worker inside `window.addEventListener('load', ...)`, but `initPWA()` ran after the load event had already fired, so the listener never ran.
- Quran Majeed v3 and Mapamundi already worked offline.
- Tanger d'Antan had no service worker or manifest at all.

## Changes

### `ucfzem/ucfzem.github.io` — commit `e7f18b8`

- Added `works/Maktaba/sw.js`
  - Cache: `maktaba-main-v1`
  - Precaches the Maktaba shell, QR image, herbal icon, shared fonts/assets, and the library entry page.
  - Caches the Droppy avatar, Mapamundi icon, and GitHub-hosted shared assets cross-origin.
  - Network-first navigation with offline fallbacks for `/works/Maktaba/` and `/works/Maktaba/library/`.
  - Activates and claims clients; deletes only old `maktaba-main-*` caches.
- Registered the service worker from `works/Maktaba/index.html`.
- Fixed `al-ajwiba-al-musaddada/app.js`
  - `initPWA()` now registers immediately when `document.readyState === 'complete'`, otherwise on `load` with `{ once: true }`.

### `ucfzem/tanger` — commit `ca0a202`

- Added `tanger/sw.js`
  - Cache: `tanger-v1`
  - Precaches `./`, `./index.html`, `./favicon.ico`.
  - Runtime-caches same-origin images, music, and history assets with stale-while-revalidate.
  - Network-first navigation with an offline `index.html` fallback.
  - Runtime-caches cross-origin assets such as Google Fonts.
- Registered the service worker from `tanger/index.html`.

## Verification

Local Playwright checks passed for both fixes before deployment. Live Playwright checks after GitHub Pages deployment:

- Maktaba main, GitHub origin: offline reload `200`, QR/title rendered, 29 app rows, avatar loaded.
- Maktaba main, Cloudflare origin: offline reload `200`, same result.
- Maktaba library: offline reload `200`.
- Works root: offline reload `200`.
- All 31 library app URLs: offline reload `200` (35 total cases incl. extras; 0 failures).
- `al-ajwiba-al-musaddada`: service worker auto-registered; offline reload `200`.
- Quran Majeed v3 (Cloudflare): offline reload `200`; caches `qmv3-shell-v5`, `qmv3-data-v5`.
- Mapamundi (GitHub): offline reload `200`; cache `mapamundi-cache-v1.0.5`.
- Tanger d'Antan, GitHub and Cloudflare: offline reload `200`, all 60 gallery images loaded; cache `tanger-v1`.

## Live links

- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Maktaba (Cloudflare): https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/
- Maktaba service worker: https://ucfzem.github.io/works/Maktaba/sw.js
- Maktaba commit: https://github.com/ucfzem/ucfzem.github.io/commit/e7f18b8
- Maktaba library: https://ucfzem.github.io/works/Maktaba/library/
- Tanger: https://ucfzem.github.io/tanger/
- Tanger (Cloudflare): https://ucfzem.azer-tyu199p.workers.dev/tanger/
- Tanger service worker: https://ucfzem.github.io/tanger/sw.js
- Tanger commit: https://github.com/ucfzem/tanger/commit/ca0a202
- Quran Majeed v3: https://ucfzem.azer-tyu199p.workers.dev/quran-majeed-v3/
- Mapamundi: https://ucfzem.github.io/mapamundi/
