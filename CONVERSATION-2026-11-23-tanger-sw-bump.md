# Conversation Backup — tanger SW cache bump (2026-11-23)

## Scope
- Repo: `ucfzem/ucfzem.github.io`
- Branch: `main`
- App: `tanger`

## Issue
- User reported still seeing old Tanger history button despite pushed CSS/HTML update.
- Live Pages/Worker still served old button; `tanger/sw.js` existed on live site (`CACHE='tanger-v1'`, caches `./index.html`) but was not in repo. Old clients can keep stale cached index.

## Fix
- Added `tanger/sw.js` from live and bumped cache `tanger-v1` -> `tanger-v2`.
- Commit: `fb9f5e7` chore(tanger): bump service worker cache to v2.

## Notes
- GitHub Pages/Worker/CDN propagation may delay; stale SW clients may need one hard refresh/clear site data/close-reopen.
- `shubuhat-wa-rudud` local edits remain unstaged.
