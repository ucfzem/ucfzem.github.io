# Conversation backup — 2026-10-19 (al-bishara full-book content translation)

## Objective

Following the UI-only i18n, translate the **full book content** (not just chrome) into
English, French and Spanish, so switching the language in the reader changes the actual
chapter text too. Requested by the owner ("Whole UI incl. book text").

## Reality check on the pasted plans

Several ChatGPT-generated plans were supplied that assumed a different codebase
(`js/reader.js`, `js/i18n.js`, `css/styles.css`, `locales/<lang>/chapters/*.json`,
`paragraphs`/`subtitle` fields, `window.i18n`). None of that exists here: the app is
`al-bishara/app.js` + one data file `al-bishara/data/chapters.json` whose chapters have
`blocks` (HTML: `<b>`, `<blockquote>`, `<ul>/<ol>/<li>`). The plans were therefore **not**
applied verbatim — a pasted GitHub Actions file would have failed (`locales/ar/chapters`
missing), and a pasted "theme/refresh/search" reader would have replaced the working
search/highlight/offline reader. Theme switching and font controls already existed.

## Approach (chosen by owner: "Finish now locally")

1. **Generator** `al-bishara/tools/translate-book.mjs`: reads `data/chapters.json`, produces
   `data/chapters.<en|fr|es>.json` mirroring the exact structure (`meta`/`parts`/`chapters`/
   `blocks`). HTML-aware — tags are never sent to the translator, only text runs. Long runs are
   chunked on sentence boundaries (`<=1200` chars). Retries with exponential backoff, ~120 ms
   pacing, and resumable (already-translated chapters are skipped).
2. **Translation source**: the free Google endpoint
   `translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=<lang>&dt=t`.
3. **Runtime** (`app.js`): a per-language book cache (`bookCache`). `loadData()` loads Arabic,
   then `ensureLang(lang)` fetches the current language's file; `setLanguage()` swaps the active
   book and re-routes. **Fallback**: if a translation file is missing/fails, the Arabic original
   is shown with a warning note. A visible badge
   ("🌐 Machine translation — the Arabic original is authoritative") is rendered in home and
   chapter views whenever the displayed text is a translation. `normalize()` was widened to keep
   Latin-1 accented letters so search works in French/Spanish.
4. **Service worker**: `al-bishara/sw.js` `bishara-v1.0.3 → v1.0.4`, CORE += the three
   translated book files. Root `sw.js` `DATA_MARKER /__bookdata-v24 → v25` so the root mirror
   refreshes its cached copy of the app too.
5. Locale files got `ui.mtNote` / `ui.mtUnavailable`; `style.css` got `.mt-note`.

## Result

- `data/chapters.en.json` (148 KB), `data/chapters.fr.json` (164 KB), `data/chapters.es.json`
  (156 KB) — 20 chapters, 4 parts each; block counts and tags preserved exactly.
- Example: ch.5 title → "Chapter Two: Refraining from distorting good news";
  part → "Part One: Initial objections"; es ch.13 → "Capítulo Uno: Abdullah el Ismaili (Isaías 42)".

## Verification (local, Playwright)

- `/tmp/opencode/test-book-i18n.mjs` — **21/21**: Arabic default stays Arabic; en/fr/es chapter
  bodies and titles become Latin-script translations; badge shown; in-chapter + global search work
  against translated text; persists across reload; **offline** serves the translated body and all
  four book files from `bishara-v1.0.4`; 0 console errors.
- `/tmp/opencode/test-i18n.mjs` (UI suite, queries updated for translated content) — **51/51**.

## Files changed

- `al-bishara/tools/translate-book.mjs` (new), `al-bishara/data/chapters.{en,fr,es}.json` (new)
- `al-bishara/app.js`, `al-bishara/style.css`, `al-bishara/sw.js`
- `al-bishara/locales/{ar,en,fr,es}.js`
- root `sw.js`

## Caveat

Machine translation of a scholarly religious text is approximate; the Arabic original remains
authoritative and is the default.

## Backups

- `backups/al-bishara-book-i18n-2026-10-19/` — verbatim copies of every changed file.

## Addendum — honorific glossary fix (glose du début du livre)

Machine translation rendered BOTH honorifics as "the Word of God" in `ch1/blk0`
(`…عيسى كلمة الله، وموسى كليم الله…`). Corrected Moses (Jesus was already right):

- en: `Moses, the Word of God` → **`Moses, to whom God spoke`**
- fr: `Moïse, la Parole de Dieu` → **`Moïse, l'interlocuteur de Dieu`**
- es: `Moisés, la Palabra de Dios` → **`Moisés, el interlocutor de Dios`**

Added a `GLOSSARY`/`postfix()` step to `tools/translate-book.mjs` so re-runs keep the fix.
SW bumped `bishara-v1.0.4 → v1.0.5`, root `DATA_MARKER v25 → v26`.
