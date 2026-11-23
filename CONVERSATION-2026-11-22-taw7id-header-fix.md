# Conversation Backup — taw7id header/search fix (2026-11-22)

## Scope
- Repo: `ucfzem/ucfzem.github.io`
- Branch: `main`
- App: `taw7id`
- Constraint: keep `shubuhat-wa-rudud` unstaged; no `git add -A`, no force-push/reset/clean.

## Issues reported
1. Missing magnifier in some browsers (old cached app showing search bar always open / no toggle).
2. Text showing through header and search panel due to translucent backgrounds/backdrop behavior.

## Fix
- `taw7id/sw.js`: bumped cache `tawhid-book-v18` -> `tawhid-book-v19`; `skipWaiting()` and `clients.claim()` already present.
- `taw7id/css/style.css`: made `.app-header` opaque (`background: var(--bg)`), removed rgba; made `.search-bar` opaque sticky below header (`top: var(--header-h,72px)`, `z-index:99`, `backdrop-filter:none`).
- `taw7id/js/app.js`: added `syncHeaderHeight()` to set `--header-h` on init, search open, and resize.

## Verification
- `node -c taw7id/js/app.js taw7id/sw.js` passed.
- Commit pushed to `origin/main`.

## Commit
- `c71bc49ec2f9c4e15f7ea7c3d6f4b2e1a0d9c8b7` (see git log for exact hash in repo state)

## Notes
- Stale clients may need one manual clear site data / close-reopen PWA to pick up v19 after propagation.
- `shubuhat-wa-rudud/index.html` and `shubuhat-wa-rudud/sw.js` remain unstaged local edits.
