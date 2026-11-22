# Conversation Backup — a3lam-al-dawa follow-up (2026-11-22)

## Scope
- Repo: `ucfzem/ucfzem.github.io`
- Branch: `main`
- App: `a3lam-al-dawa`
- Worker: `ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/` (proxies to GitHub Pages)

## Issue
- User reported old Dr. Haitham Talaat bio still deployed: "وُلد في ستينيات القرن العشرين..."
- Correct bio: born 1981, Minya, Upper Egypt (user-provided Arabic/EN/FR/ES text).

## Root cause
- `a3lam-al-dawa/index.html` contained an inline `scholars` array with the old bio; prior fix updated `data.js` only.
- Service worker was cache-first for app assets; cache bump needed after fix.

## Changes
- `a3lam-al-dawa/data.js`: updated `PROFILES.talaat.bio.ar/en/fr/es` (commit `2e243e6`).
- `a3lam-al-dawa/index.html`: updated scholar n="01" Haitham Talaat `desc.ar/en/fr/es` (commit `cebe9ab`).
- `a3lam-al-dawa/sw.js`: bumped cache `v41`->`v42`->`v43` (commits `f7747cd`, `820f901`).

## Verification
- `node -c a3lam-al-dawa/data.js` passed.
- Local grep confirms old "ستينيات القرن العشرين" removed from `a3lam-al-dawa/index.html`.
- Live origins should be checked after CDN propagation; client may need hard refresh/clear SW due to prior cached `index.html/data.js`.

## Commits
- `2e243e6dc444b289a020a3392c583b7f9af623e5` fix(a3lam-al-dawa): update Dr. Haitham Talaat biography
- `f7747cd` chore(a3lam-al-dawa): bump service worker cache to v42
- `cebe9ab` fix(a3lam-al-dawa): update Dr. Haitham Talaat bio in index.html
- `820f901` chore(a3lam-al-dawa): bump service worker cache to v43

## Notes
- `shubuhat-wa-rudud/index.html` and `shubuhat-wa-rudud/sw.js` remain unstaged local edits, untouched.
- No force-push/reset/clean/git add -A used.
