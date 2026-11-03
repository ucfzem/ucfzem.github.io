# Conversation backup — Doors index & text now translate (2026-11-03)

Repo: ucfzem/ucfzem.github.io | Branch: main | Commit: 4380b81

## Problem
Switching to English / French / Spanish changed the UI labels only.
The "index" (doors list) stayed Arabic because the 11 door buttons were
hardcoded in the HTML, and paragraph translation depended on a live API call.

## Fix
1. Doors index is now data-driven (`DOORS` array) with ar/en/fr/es titles and
   rendered by `renderDoors(lang)` inside `changeLanguage()`.
   - Text alignment switches (right for Arabic, left for Latin).
   - Total: 11 doors, numbers 01..11 preserved.
2. Added `basair02/content-translations.js` with local, pre-generated
   translations of all 57 paragraphs in en / fr / es.
   - Instant switching, no network needed, works offline.
   - `renderPage()` uses local translations first; API is only a fallback for
     missing entries.
3. Search now matches the displayed language:
   - Arabic query searches Arabic text.
   - English/French/Spanish queries search translated text.
4. Service worker cache bumped to basair02-v9 and includes
   content-translations.js.
5. Footer build marker updated to "build v9".

## Verification (headless DOM tests)
- AR: 11 doors, first = الباب الأول..., paragraph Arabic.
- EN: dir=ltr, title "Basair Encyclopedia", first door
  "Part 1: Introduction to the Study of New Atheism", paragraph English.
- FR: "Partie 1 : Introduction à l'étude du nouvel athéisme", French text.
- ES: "Parte 1: Introducción al estudio del nuevo ateísmo", Spanish text.
- Back to AR: Arabic restored.
- Search: EN "consciousness" -> 3 results; AR "الوعي" -> 4 results.

## Files
- basair02/index.html
- basair02/sw.js
- basair02/content-translations.js (new)

## Links
- https://ucfzem.github.io/basair02/
- https://ucfzem.github.io/works/
- https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/CONVERSATION-I18N-DOORS-2026-11-03.md
