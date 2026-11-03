# Conversation backup — Font size buttons + mobile/TV friendly (2026-11-03)

Repo: ucfzem/ucfzem.github.io | Branch: main | Commit: ea74bae

## Problem
The A+/A/A- controls were reported missing. Root cause: the earlier "font size"
change was written in chat but never actually committed; the deployed
basair02/index.html had no font-size code at all.

## Fix
Header (basair02/index.html):
- Wrapped header in flex-wrap; compact paddings (px-2 py-2 on mobile).
- Title/subtitle truncate and shrink on small screens.
- Added visible buttons: A− | A | A+ plus live px label.
- Language select compact (11px), theme button compact.

Font sizing:
- CSS var --reader-font-size on :root, applied to #reader-card (paragraphs inherit).
- Range 12–32 px (includes very small sizes), default 16 px.
- Persisted in localStorage key "basair-font-px".
- Reset button (A) returns to 16 px.
- Smooth transition .2s.

Compressed layout:
- main padding p-2 sm:p-4, spacing space-y-2 sm:space-y-4.
- reader card p-4 sm:p-6.

TV remote / keyboard friendly:
- Visible :focus-visible outline (3px amber) on all controls.
- ArrowRight/ArrowLeft = next/previous page (direction-aware for RTL).
- +/= = bigger, -/_ = smaller, 0 = reset, / = focus search, t = theme, d = doors.

Offline:
- Service worker cache bumped basair02-v5 -> basair02-v6 to refresh shell.

## Files
- basair02/index.html
- basair02/sw.js

## Links
- https://ucfzem.github.io/basair02/
- https://ucfzem.github.io/works/
- https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/CONVERSATION-FONTSIZE-MOBILE-TV-2026-11-03.md
