# Tanger Offline SW - 2026-11-23

## Git
- `c2eebeb` feat(tanger): add offline caching service worker v4

## Changes
- `tanger/sw.js`: replaced self-unregister cleanup with offline-capable `tanger-v4`.
  - Precaches `./`, `./index.html`, `./histoire/`, `./histoire/index.html`.
  - Navigation: network-first, cache fallback, offline HTML fallback.
  - Assets: stale-while-revalidate (cache then background update), origin-scoped GET only.
  - Activates immediately (`skipWaiting` + `clients.claim`), removes old `tanger-*` caches.
- `tanger/index.html`: SW registration cache-bust `./sw.js?v=2026-11-23-v4-offline`.
- `tanger/histoire/index.html`: added SW registration `../sw.js?v=2026-11-23-v4-offline`.

## Caveats
- First load must be online to populate cache. Old clients with cleanup SW may need one reload/clear site data.
- Worker serves `/tanger/*` with `no-store`; SW still stores response clones in Cache Storage for offline use, but browser/worker cache headers may affect freshness expectations.
- History images not in git are served via worker fallback to GitHub Pages; offline depends on them being fetched/cached while online.
- `ucfzem.github.io` Pages may remain stale until CDN propagates.

## Links
- https://ucfzem.azer-tyu199p.workers.dev/tanger/
- https://ucfzem.azer-tyu199p.workers.dev/tanger/histoire/
- https://ucfzem.github.io/tanger/
- https://ucfzem.github.io/tanger/histoire/
- https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/tanger/sw.js
