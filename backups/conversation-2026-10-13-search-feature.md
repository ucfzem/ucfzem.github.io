# Conversation Backup — 2026-10-13 — Word Search feature (al-adhama + asrar-al-kawn)

## Task
Add a word-based full-text search bar to the book webapps on GitHub Pages.
User selected targets: **al-adhama book** + **all book apps missing search**.
Feature set requested (provided as generic drop-in snippets across the session):
- live filtering of items
- `<mark>` highlighting of matched words
- live match counter
- "no results" state
- clear (×) button
- `/` keyboard shortcut to focus the search box

## Audit (which apps already had search)
| app | had search? |
|---|---|
| al-tibb-al-nabawi | yes (`#searchInput`) |
| nuzhat-al-mushtaq | yes (`#indexSearchInput`) |
| tarikh-ibn-khaldun | yes (`#searchInput`) |
| mujam-al-buldan | yes (`#globalSearchInput`) |
| al-adhkiya | yes (`#indexSearchInput`) |
| livre-al-istibsar | yes (content search) |
| al-mudhish | yes (built earlier) |
| **asrar-al-kawn** | **NO** |
| **al-adhama** | **NO** |

→ Only `asrar-al-kawn` and `al-adhama` needed work. Both share the same
`/tmp/opencode/asrar_index.template.html`, so the feature was implemented once
in the template and both were rebuilt.

## Implementation
Edited `/tmp/opencode/asrar_index.template.html`:
- CSS: `.search-wrap`, `.input-container`, `#searchInput`, `#clearBtn`,
  `.match-counter`, `.no-results`, `.search-result`, `.snippet`, `mark`,
  and `[hidden]{display:none!important}` (needed because `.chapter-list` sets `display:grid`).
- `home()`: added search box (`#searchInput`, `#clearBtn`), `#matchCounter`,
  `#noResults`, and a `#searchResults` list; gave the normal list `id="chapterList"`.
- New JS (inside the existing IIFE): `escRe`, `normAr` (Arabic normalization:
  strip tashkeel, unify alef/hamza/ya/ta-marbuta), `highlightIn` (safe DOM
  text-node `<mark>` wrapping, no innerHTML), `runSearch`, `clearSearch`.
- `show()`: highlights `HL_QUERY` inside the opened article.
- `/` keydown listener focuses `#searchInput`.
- Fixed bug: inline `oninput`/`onclick` can't call IIFE-scoped functions →
  wired handlers via JS in `home()` instead.

Search matches on chapter **title OR full content** (normalized), renders
matching chapters with a highlighted snippet, live counter "N من M فصل",
and clicking a result opens the chapter with matches highlighted.

## Build
- `node /tmp/opencode/asrar_build_index.mjs` → `/tmp/asrar-al-kawn/index.html` (15 chapters, ~110 KB)
- `node /tmp/opencode/build_adhama_index.mjs` → `/tmp/al-adhama/index.html` (52 chapters, ~1.98 MB)
- Inline script syntax OK (3/3 each).

## Test (Playwright, file://)
- asrar: query "الله" → results visible, 15/15 chapters, 24 `<mark>`, clear visible;
  opened chapter had 3 marks; `/` focuses search; bogus query → "0 من 15 فصل" + no-results.
- adhama: query "الله" → 52/52 chapters, 61 `<mark>`; opened chapter 13 marks;
  `/` focuses search; bogus query → "0 من 52 فصل" + no-results. No page errors.

## Deploy
- `asrar-al-kawn` commit `637fef3` pushed to `main`; SW cache `asrar-cache-v1.0.0` → `v1.1.0`.
- `al-adhama` commit `35e7bb6` pushed to `main`; SW cache `al-adhama-cache-v1.0.0` → `v1.1.0`.
- Live:
  - https://ucfzem.github.io/asrar-al-kawn/
  - https://ucfzem.github.io/al-adhama/

## Notes
- Template drives both apps; future edits should be made in the template then rebuilt
  so builds stay in sync (build_adhama_index.mjs does exact-string substitutions — do not
  alter the strings it targets).
