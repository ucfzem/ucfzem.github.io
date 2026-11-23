# Conversation Backup — tanger cache bust (2026-11-23)

## Issue
- User reported old Tanger history button still visible on live Worker/Pages after style+SW commits.
- Live fetches still returned old `.history-more` CSS; GitHub Pages headers showed stale `last-modified` / edge cache behavior.

## Action
- Added harmless cache-bust marker comment before the history button in `tanger/index.html`.
- Commit: `11588f8` chore(tanger): cache-bust history button markup.

## Notes
- Raw GitHub already has new CSS/SW; live CDN propagation and client SW cache may still delay. User should hard refresh/clear site data for tanger if needed after propagation.
- `shubuhat-wa-rudud` local edits remain unstaged.
