# Maktaba Offline Consistency - 2026-11-23

## Git
- `6c394e1` feat(maktaba): harden offline SW and app-shell routing

## Scope
- `works/Maktaba/index.html`
- `works/Maktaba/sw.js`
- `works/Maktaba/library/index.html`
- `works/Maktaba/library/sw.js`

## What changed
- Maktaba main SW bumped to `maktaba-main-v9`; install precache resilient with `Promise.allSettled`; navigation network-first with cached fallback; assets cache-first/network-update with opaque/cross-origin caching attempts; old `maktaba-main-*` caches cleaned.
- Maktaba library SW bumped to `maktaba-library-v2`; resilient precache, navigation fallback, cache cleanup.
- Maktaba index adds `data-app` ids and a lightweight `?url=` shell route that shows offline/opening status and hands off to target URL. This improves same-origin shell behavior but cannot guarantee third-party/other-origin app offline unless that app has its own SW/cache and was visited online once.
- SW registration cache-busted (`sw.js?v=maktaba-main-v9`, `library/sw.js?v=maktaba-library-v2`).

## Important limitation
- “Every webapp in Maktaba loading same online/offline” is only fully true for apps that: are on same origin/scope reachable by their own SW, have offline-capable SW/assets cached, and were opened at least once online. Many linked apps are separate GitHub Pages origins/paths or external worker URLs; Maktaba cannot force them fully offline without changing each app itself.
- Local repo contains only some linked apps: `a3lam-al-dawa`, `a3lam-al-3olama`, `shubuhat-wa-rudud`, `taw7id`, `tanger`. Others are not present in this checkout.

## Verification
- `node -c works/Maktaba/sw.js works/Maktaba/library/sw.js` OK.
- Pushed to `main`. GitHub Pages CDN may lag; clear site data/SW if stale.

## Links
- https://ucfzem.github.io/works/Maktaba/
- https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/ (if proxied by worker)
- https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/works/Maktaba/index.html
- https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/works/Maktaba/sw.js
