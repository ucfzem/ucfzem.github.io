# Conversation — 2026-10-19 — Al-Bishara: fix new font not loading offline

## Symptom
After switching the reading font to Cairo (#2805b2d), offline mode showed the old
serif font (or a fallback) — the new font "not loading".

## Root cause
Two service workers are registered on the app page (index.html):
`./sw.js` (scope /al-bishara/) and `/sw.js` (root, scope /). The app SW path was
already fine (verified: offline -> style.css?v=4 + Cairo). The failure came via
the **root SW** (active when the page is reached through the /works/ portal):
its same-origin asset handler served **cache-first with `ignoreSearch: true`**,
so a stale mirrored `style.css?v=3` (Amiri) was returned for the new
`style.css?v=4` request -> old font offline.

## Fix
- root `sw.js`: asset handler now does **exact-match first**, then background
  revalidation (stale-while-revalidate) so the mirror converges to `?v=4`, and
  only falls back to a loose `ignoreSearch` match offline. (DATA_MARKER v29->v30)
- al-bishara `sw.js`: offline same-origin fallback also tries
  `caches.match(req, { ignoreSearch: true })` as a last resort. (CACHE -> v1.0.9)

## Tests
- forced ROOT-SW control (unregistered app SW), offline reload:
  controller=/sw.js, href=./style.css?v=4, ff=Cairo, align=start -> PASS
- app-SW path offline: style.css?v=4, Cairo, start -> PASS
- book i18n 21/21; UI i18n 51/51
- app SW bishara-v1.0.9; root DATA_MARKER v30

## Note for the user
After deploying, open the app once **online** so the new SW/asset version is
cached; then offline will use Cairo.
