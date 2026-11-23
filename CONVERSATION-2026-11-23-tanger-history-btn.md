# Conversation Backup — tanger history button (2026-11-23)

## Scope
- Repo: `ucfzem/ucfzem.github.io`
- Branch: `main`
- App: `tanger` (served via Cloudflare Worker `ucfzem.azer-tyu199p.workers.dev`, proxied to GitHub Pages)
- Constraint: keep `shubuhat-wa-rudud` unstaged; no `git add -A`, no force-push/reset/clean.

## Change
- Added `tanger/index.html` and `tanger/histoire/index.html` to the repo (captured from live worker source; repo did not previously contain `tanger/`).
- Updated `.history-more` button in `tanger/index.html` only: flex layout, 44px min touch target, centered fit-content, gold gradient/border/shadow, hover lift, and arrow wrapped in `<span aria-hidden="true">` with `translateX(-4px)` on hover/active. Applied to all 4 i18n `history_more` strings (fr/en/es/ar).
- Added `tanger` to sparse-checkout to allow staging.

## Verification
- `git diff` before commit showed only intended `.history-more` CSS/HTML/i18n changes in `tanger/index.html`.
- Commit pushed to `origin/main`.

## Commit
- `429f9ca` feat(tanger): improve full-history button styling

## Notes
- `tanger` is worker-served; GitHub Pages files added for repo backup/deploy parity as requested.
- `shubuhat-wa-rudud/index.html` and `shubuhat-wa-rudud/sw.js` remain unstaged local edits.
