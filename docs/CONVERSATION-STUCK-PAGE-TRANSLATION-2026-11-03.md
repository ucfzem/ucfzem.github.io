# Conversation backup — "stuck at door 11 / won't change" fix (2026-11-03)

Repo: ucfzem/ucfzem.github.io | Branch: main | Commit: ca7f896

## Symptom reported
The page stuck on door 11 and pagination would not change anything.

## Root cause found (reproduced in a headless DOM test)
1. The browser can restore the <select id="lang-select"> to a non-Arabic
   value WITHOUT firing `change`. `renderPage()` read that value directly.
2. `translateText()` called Google Translate with NO timeout and every
   paragraph was awaited sequentially. When the request hangs, `renderPage()`
   never finishes: the reader stays blank/loading and the page selector keeps
   its old value => looks frozen on one door and buttons appear dead.
3. Two automatic handlers (`load` +400ms and `pageshow`) called
   `forceFirstDoor()`, which could undo a user's page change.

## Fix
- translateText(): AbortController with 4s timeout, in-memory cache, returns
  original Arabic text on failure.
- renderPage(): renders the page immediately (Arabic), sets the page selector
  and scrolls right away, then translates progressively in parallel.
  It never blocks navigation again.
- HTML escaping helper added before injecting paragraph text.
- init(): restores language from localStorage ("basair-lang") through
  changeLanguage(), so the select and the rendered language always match.
- changeLanguage(): persists chosen language, syncs the select value.
- userNavigated flag: automatic load/pageshow resets are skipped once the user
  has navigated (no more snapping back).
- Removed the delayed forceFirstDoor(400ms) that could undo a tap.
- Service worker:
  * cache basair02-v8, navigation fetched with cache: 'no-store'
  * registration uses ./sw.js?v=8, updateViaCache:'none', reg.update()
  * one-time reload on controllerchange (guarded by sessionStorage)
- Visible footer build marker: "build v8" to confirm the device is on the
  new version.

## Verified with jsdom
- Initial load: page 0, 5 paragraphs, starts at first door.
- With translation hung: content still renders and page changes work.
- changePage(4) -> value 4, changePage(1) -> value 1, jumpToDoor(20) -> 4,
  clearSearch -> 0. Font controls: 16 px default.
- No automatic reset after user navigation.

## Files
- basair02/index.html
- basair02/sw.js

## Links
- https://ucfzem.github.io/basair02/
- https://ucfzem.github.io/works/
- https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/CONVERSATION-STUCK-PAGE-TRANSLATION-2026-11-03.md
