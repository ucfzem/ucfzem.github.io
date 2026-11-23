# Conversation Backup - Offline PWA Batch

**Date:** 2026-11-23
**Repo:** `ucfzem/ucfzem.github.io` (main)
**Scope:** Batch offline PWA hardening for local Maktaba-linked apps in repo.

## User Request
- Standardize offline PWA Service Worker support across Maktaba sub-apps in repo: `a3lam-al-3olama`, `shubuhat-wa-rudud`, `taw7id`, `tanger`, `a3lam-al-dawa` and any local book/library folders.
- Add missing SW/manifest for `a3lam-al-3olama`.
- Verify/update existing SWs for relative paths, unique cache prefixes, bump versions where needed.
- Commit/push unstaged `shubuhat-wa-rudud` local edits as requested by user.
- Patch Cloudflare Worker routing for subpath SW scope/trailing slash/content-type handling (script prepared locally; deployment requires API token).
- Save backup conversation, push, share links.

## Audit (local repo / Maktaba-linked)
| App | In repo | index | sw.js | manifest | Status |
|---|---:|---:|---:|---:|---|
| `a3lam-al-3olama` | yes | yes | **added** | **added** | Offline-ready after first online visit |
| `shubuhat-wa-rudud` | yes | yes | yes | no | Existing SW kept; local unstaged edits committed per request; cache bumped to `v2026-11-23a` |
| `taw7id` | yes | yes | yes | yes | Existing SW verified (`tawhid-book-v19`, relative precache, activate cleanup) |
| `tanger` | yes | yes | yes | no | Existing SW verified (`tanger-v4`, relative paths, cleanup, scoped registrations) |
| `a3lam-al-dawa` | yes | yes | yes | yes | Existing SW verified (`a3lam-al-dawa-v43`); registration scope made explicit |
| `works/Maktaba` | yes | yes | yes | yes | Prior v9/v2 hardening retained |
| 29 book/library apps listed by Maktaba | no | - | - | - | External/missing from repo - must be updated in their own repos/hosts |
| `mapamundi` | no | - | - | - | External repo |
| `quran-majeed-v3` | no | - | - | - | External Cloudflare Worker app |

## Changes Made
### `a3lam-al-3olama/` (Priority 1)
- Added `sw.js` with unique prefix `a3lam-al-3olama-v1`, static/runtime caches, precache core HTML/icon/fonts/27 portraits, `skipWaiting()`, old-cache cleanup on activate, `clients.claim()`, navigate network-first with cache fallback, same-origin asset cache-first with runtime caching.
- Added `manifest.json` scoped to `./`.
- Registered SW in `index.html` with `register('./sw.js', { scope: './' })` on load; added manifest/theme-color links.

### `shubuhat-wa-rudud/` (Priority 3 - existing SW, deploy requested)
- Bumped cache version `v2026-11-20h` -> `v2026-11-23a` (unstaged local change was present; user requested commit/push).
- Made SW registration explicit with `{ scope: './' }`.
- Preserved existing content edits present in working tree (user requested deploy/push).

### `a3lam-al-dawa/` (Priority 3 - existing SW)
- Made SW registration explicit: `register('./sw.js', { scope: './' })`.

### `tanger/` and `taw7id/` (Priority 3 - existing SW)
- Audited: relative precache/fallback paths, unique prefixes, activate cleanup, skipWaiting/claim present. No code change required.

## Cloudflare Worker (`/tmp/ucfzem-worker.js`, local patch prepared)
- Added trailing-slash 301 redirect for bare `/tanger`, `/a3lam-al-dawa`, `/quran-majeed-v3`.
- Extended raw-GitHub+SW-safe handling to `/a3lam-al-dawa/*` as well as `/tanger/*`.
- Existing behavior keeps `Content-Type` by extension (`application/javascript` for `.js`), strips CSP/XFO, sets `Cache-Control: no-store, no-cache, must-revalidate`.
- **Not deployed from this environment**: no Cloudflare API credentials in env; `/tmp/ucfzem-worker.js` contains secrets and must not be committed. Deploy with authorized Cloudflare API `PUT /client/v4/accounts/551159a931a5eb5754de241eb6ae2b7c/workers/scripts/ucfzem`.

## Verification
- `node --check` passed: `a3lam-al-3olama/sw.js`, `shubuhat-wa-rudud/sw.js`, `a3lam-al-dawa/sw.js`, `taw7id/sw.js`, `tanger/sw.js`.
- Git status inspected before staging; specific paths staged only.

## External/Worker Apps Still Needing Own SW Updates
- `https://ucfzem.azer-tyu199p.workers.dev/quran-majeed-v3/` - external worker; add/register scoped SW in its own worker/repo.
- `https://ucfzem.github.io/mapamundi/` - not in this repo.
- 29 Maktaba book/library apps not in this repo - each needs own scoped `sw.js`, manifest, precache, and first online visit per origin/scope.
- Any worker-served copy must serve `/<app>/sw.js` as `application/javascript` with no-cache and correct subpath scope.

## Caveats
- Offline works after first successful online visit per origin/scope. Old clients may need SW update/clear site data once.
- GitHub Pages CDN propagation may lag; worker URLs may show raw-backed content sooner for patched routes.
- `shubuhat-wa-rudud` had local unstaged edits before this task; they were included because user explicitly requested deploy/push.
