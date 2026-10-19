# Conversation backup — 2026-10-19 (al-bishara reader i18n)

## Objective

Add a UI-layer internationalization to the `al-bishara` reader
(`https://ucfzem.github.io/al-bishara/`): **Arabic 🇲🇦 / English 🇬🇧 / French 🇫🇷 / Spanish 🇪🇸**,
with a flag switcher, dynamic RTL/LTR, and `localStorage` persistence — **without translating the
book itself** (the book text is presented exactly as in the source, in Arabic, by design).

## Key decisions

- **UI only.** The reader text is untouched; only UI strings, `<title>`, meta description and
  `lang`/`dir` change. No invented book translations.
- **One locale file per language** under `al-bishara/locales/` (`ar|en|fr|es.js`), each assigning
  `window.LOCALES.<lang>` with `meta` (lang/dir/flag/name), `html` (title/description) and `ui`
  (all UI strings, incl. `{n}`/`{q}`/`{c}`/`{s}` placeholders).
- **`ar` is the source of truth and the fallback** for any missing key (dotted-path lookup).
- **Digits:** Arabic (`٠١٢٣…`) in `ar`, Latin elsewhere (`fmtNum`).
- **No flash of wrong direction:** the inline `themeBoot` script now also reads `bishara_lang`
  and sets `<html lang dir>` before first paint.
- **`setLanguage`** saves to `localStorage('bishara_lang')`, reapplies static i18n, syncs the flag
  button, refreshes the open drawer list, and re-runs `route()` (only if the book is loaded).
- **Flags dropdown** (`#langToggle` + `#langMenu` with 4 `data-lang` buttons): active highlight,
  outside-click/Escape close; menu labels are static native names.
- **CSS uses logical properties already**; the only physical-direction rules (`text-align: right`
  ×6) were switched to `text-align: start` so both directions lay out correctly.
- **Service worker:** `al-bishara/sw.js` cache bumped `bishara-v1.0.2 → bishara-v1.0.3`, CORE += the
  4 locale files, stylesheet precache `?v=2 → ?v=3`. Root `sw.js` `DATA_MARKER` bumped
  `/__bookdata-v23 → v24` so devices re-run the mirror and pick up the new locale assets.
- Earlier-session hardening (`fetchTO` 8 s timeouts in all three service workers, self-hosted fonts)
  is preserved untouched.

## Files changed

- `al-bishara/locales/{ar,en,fr,es}.js` — new.
- `al-bishara/index.html` — lang boot in `themeBoot`, flag switcher markup, `data-i18n*`
  attributes, locale `<script>`s before `app.js`, `style.css?v=3`.
- `al-bishara/app.js` — i18n core (`t`, `tsub`, `fmtNum`, `applyStaticI18n`, `applyDocumentLang`,
  `setupLangSwitch`, `setLanguage`) and all render paths routed through it; pager arrows moved into
  locale strings.
- `al-bishara/style.css` — `text-align: start` ×6; `.lang-switch`/`.lang-menu` styles incl.
  `.lang-menu[hidden] { display: none; }`.
- `al-bishara/sw.js` — `bishara-v1.0.3` + locale precache.
- `sw.js` — `DATA_MARKER /__bookdata-v24`.

## Verification (local, Playwright)

`/tmp/opencode/test-i18n.mjs` — **51/51 passing**:

- default `ar`/`rtl`; switcher opens with 4 options; switching to `en` → `dir=ltr`, English
  `<title>`/UI, Latin digits; persists across reload; `fr`/`es`/`ar` cycle correct in chapter view;
  search results + occurrence counter + highlighting still work per language; drawer + filter;
  Escape/outside-click close; **offline reload in `en`** serves English UI from cache while the
  Arabic book text renders with the self-hosted Amiri font (4 locale files confirmed in
  `bishara-v1.0.3`); **0 console errors** online and offline.

## Backups

- `backups/al-bishara-i18n-2026-10-19/` — verbatim copies of every changed file (incl. locales).
