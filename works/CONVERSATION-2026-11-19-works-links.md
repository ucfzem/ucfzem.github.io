# Conversation backup — works links (2026-11-19)

## Summary
- Added **أعلام العلماء** (`a3lam-al-3olama`) to the unlocked/public section of `works/index.html` (entry #20) with icon `https://ucfzem.github.io/a3lam-al-3olama/icon.svg`, URL `https://ucfzem.github.io/a3lam-al-3olama/`, tag `Directory`, `newTab: true`.
- Kept existing **أعلام الدعوة والفكر والمناظرة** (`a3lam-al-dawa`, #19) unchanged.
- Made public projects subtitle count dynamic (`publicProjects.length + maktaba.length`) so it reflects current totals.
- Updated `works/sw.js`: cache `maktaba-v15` and added `https://ucfzem.github.io/a3lam-al-3olama/icon.svg` to precache.
- `works/Maktaba/index.html` and `works/Maktaba/sw.js` already listed both apps/icons; left untouched (safe/no regression).

## Verification
- `works/index.html`: 19 public entries + 31 Maktaba entries (50 total), both a3lam apps present.
- `works/sw.js`: includes both a3lam icon URLs, cache bumped to `maktaba-v15`.
- No deletions/alterations to existing unlocked or locked entries.
