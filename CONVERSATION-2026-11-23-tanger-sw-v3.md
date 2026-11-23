# Conversation Backup — tanger SW v3 cache-bust (2026-11-23)

## Issue
- Live `ucfzem.github.io/tanger/` and worker still served stale old HTML despite correct repo/raw content. GitHub Pages CDN returned old etag/last-modified.
- Caching layers: GitHub Pages CDN, Service Worker, browser cache, Cloudflare worker proxy.

## Fix
- Bumped SW cache `tanger-v2` -> `tanger-v3`.
- Cache-busted SW registration: `register('./sw.js?v=2026-11-23-v2')`.
- Commit: `ba7a029` chore(tanger): bump SW v3 and cache-bust registration.

## User guidance
- After Pages/CDN updates: unregister SW, clear site data for site, hard refresh/incognito.
- Raw already correct.

## Notes
- `shubuhat-wa-rudud` local edits remain unstaged.
