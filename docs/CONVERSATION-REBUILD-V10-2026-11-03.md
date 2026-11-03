# Conversation backup — basair02 proper rebuild (v10), 2026-11-03

Repo: ucfzem/ucfzem.github.io | Branch: main | Commit: e773684

The user supplied detailed notes on a fixed file that was not attached;
the same fixes were implemented directly in the deployed file and tested
headlessly before deploying.

## Bugs fixed
1. Door index now finds the real chapter start in the text
   (regex /^الباب\s/). Detected 11 starts at paragraph numbers
   3, 11, 21, 30, 36, 41, 45, 49, 52, 54, 56.
   - Jump clears any active search, moves to the correct page, scrolls the
     chapter heading into view (block: center) and flashes it.
2. Jump during search clears the search first (no more invalid pages).
3. Paragraph numbers are real positions in allParagraphs (filteredIndices),
   not positions in the filtered list.
4. Translation:
   - parallel requests, in-memory cache, 6s AbortController timeout
   - stale render guard (renderToken): fast clicking can no longer paint an
     old page over a new one
   - on failure it shows a visible notice instead of silently using Arabic
     (local translations still cover all 57 paragraphs offline)
5. Safety/layout:
   - translated text is HTML-escaped
   - doors grid no longer uses conflicting `hidden grid` classes
     (CSS: #doors-grid:not(.hidden){display:grid})
   - RTL arrows corrected (prev = السابق →, next = ← التالي)
   - Ctrl/Cmd/Alt +/- no longer hijack browser zoom
   - Arabic "no results" message no longer contains the Spanish word
6. Removed the forced page-0 reset on load / tab return.

## Tweaks
- Arabic-aware search (ignores tashkeel, tatweel, hamza forms, ة/ه, ى/ي),
  250 ms debounce, and numeric queries jump to that paragraph.
- Saved settings: theme, language, font size and last page.
- Prev/next disabled at the ends.
- Door grid built from data (DOORS from DOOR_STARTS + titles ar/en/fr/es).
- Text fixes: إلهاً→إلهياً, تهدى→تهدي, الاشياء→الأشياء,
  ايديولوجي→أيديولوجي, العلنية→العلّة, محدحدة→محددة.
  (العلنية→العلّة confirmed as a typo fix.)

## Verification (jsdom)
- 11 doors, page 0 start, prev disabled, RTL labels correct.
- Door 2 -> paragraph index 10 (Part 2 heading), page 2, flash applied.
- Numeric search "30" -> page 5, paragraph [30] present.
- Arabic search "الوعي" and "العلة" both return results.
- EN: dir ltr, "Part 1..." door, translated paragraph, 0 network calls.
- Ctrl+"+" ignored; theme saved.
- Saved state restore: page 3, theme light, lang en, font 20 all restored.
- Translation failure: notice displayed, Arabic text still shown.

## Files
- basair02/index.html
- basair02/sw.js (cache basair02-v10)

## Links
- https://ucfzem.github.io/basair02/
- https://ucfzem.github.io/works/
- https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/CONVERSATION-REBUILD-V10-2026-11-03.md
