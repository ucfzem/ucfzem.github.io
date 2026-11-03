# Conversation backup — Always open at first door (2026-11-03)

Repo: ucfzem/ucfzem.github.io | Branch: main | Commit: 050794c

## Problem
basair02 still opened on door 11 (page 5) by default and after refresh on mobile.

## Root causes addressed
1. Browser scroll restoration ran before/around our late handler on mobile.
2. Browser form-state restoration could restore the page <select> value.
3. Cached service-worker shell could be stale.

## Fix (basair02/index.html)
- Moved `history.scrollRestoration = 'manual'` into an inline script at the
  very top of <head> (runs before load/restore).
- Added `autocomplete="off"` to lang select, page select and search input.
- init(): forces currentPage=0, sets page-select value "0", renders, forceTop().
- forceFirstDoor(): resets to page 0, rebuilds select, re-renders if needed.
- forceTop(): resets documentElement.scrollTop, body.scrollTop, window.scrollTo.
- load handler: forceFirstDoor + forceTop at 50ms / 200ms / 400ms.
- pageshow handler: resets to page 0; if bfcache (persisted), re-render.
- visibilitychange: forceTop when tab becomes visible.

## Offline
- Service worker cache bumped basair02-v6 -> basair02-v7 so the corrected
  shell replaces the stale one.

## Files
- basair02/index.html
- basair02/sw.js

## Links
- https://ucfzem.github.io/basair02/
- https://ucfzem.github.io/works/
- https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/CONVERSATION-FIRST-DOOR-FIX-2026-11-03.md
