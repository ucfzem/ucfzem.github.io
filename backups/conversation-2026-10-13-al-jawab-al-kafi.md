# Conversation Backup — 2026-10-13 — New App: Al-Jawab Al-Kafi (الداء والدواء)

Backup of the working session for building a second Islamic-literature PWA in the same
style as المدهش, on the request:

> "Want to do the same as المدهش but with a slight change in color themes. With this book
> كتاب الجواب الكافي لمن سأل عن الدواء الشافي (الداء والدواء ibn al qayem...)"

User supplied a starter (emerald + gold theme) as the desired look.

## Deliverable

**Live app:** https://ucfzem.github.io/al-jawab-al-kafi/
**Repo:** https://github.com/ucfzem/al-jawab-al-kafi
**Book:** الجواب الكافي لمن سأل عن الدواء الشافي (الداء والدواء) — الإمام ابن قيم الجوزية (ت ٧٥١هـ)

Same architecture as المدهش: full-text search with live result counter and `/` shortcut,
chapter reader, bookmarks, dark/light themes, font controls, offline PWA with CDN
pre-cache, gold icon. **Theme difference: emerald (instead of purple-looking obsidian) +
warm gold.**

## Color Themes

- **Dark (emerald):** bg #0a2920, surfaces #0a2f23 / #0c392a / #0f4a37, gold text #f2d98c
- **Light (pale emerald):** bg #f5faf5 / #f1f7f2 / #e2ece6, gold text #a67e28, progress bar #e2b560
- Gold uses the same amberGold scale as المدهش: 400 #f2d98c, 500 #e2b560, 600 #c8922f,
  700 #a67e28, 800 #85631f

Verified computed styles: h1 #a67e28 (light), progress bar #e2b560, dark header
rgba(12,57,42,.9) = #0c392a, dark body #0a2f23, meta theme-color #0a2920.

## Book / Text Source

- Shamela EPUB: `https://old.shamela.ws/epubs/980/98093.epub` (Shamela book 158, دار عالم
  الفوائد edition) → `/tmp/opencode/jawab/jk.epub`, unzipped to 646 xhtml pages.
- Verifier's مقدمة = NCX navPoints C1–C11; real book starts at the LAST `@@PAGE:3`
  (question is quoted several times in the intro).
- NCX anchors (#C12…) do not exist in the page HTML, so chapters were split on 115
  standalone `فصل` lines.
- Final: **116 chapters, 694,352 chars**, auto-generated cleaned titles
  (e.g. ch1 «نص الاستفتاء وبداية الجواب», ch15 «منها: أنّ المعاصي تزرع أمثالَها»),
  small segments (<220 chars) merged into previous chapter.
- Files: `/tmp/opencode/jawab/{full.txt,split.js,chapters.json}` → `/tmp/al-jawab/chapters.json`
  (wrapper: funn = «فصل»).

## Build

- Template: fork of `/tmp/opencode/mudhish_index.template.html` → `/tmp/opencode/jawab_index.template.html`
  (title/meta/theme-color #0d3b2e; parchment → pale-emerald scale; darkObsidian →
  emerald scale with class names kept; theme-color JS #0a2920⇄#f5faf5; mark highlight
  rgba(226,181,96,.35); text + LS keys → al_jawab_*).
- Build: `/tmp/opencode/build_jawab_index.mjs` → `/tmp/al-jawab/index.html`
  (1,271,648 bytes, 116 chapters; 2/2 inline scripts syntax OK).
- SW: `al-jawab-cache-v1.0.0` (al-mudhish pattern: CORE + Tailwind runtime + FontAwesome
  css/woff2 + Google Fonts css2 + 18 woff2).
- Manifest: name «الداء والدواء (الجواب الكافي) — ابن القيم», theme #0d3b2e, bg #0a2920.
- Icon: `/tmp/opencode/icon_jawab_src.html` (emerald gradient + gold frame + gold «د» +
  «الداء والدواء») → icon.svg / icon-192.png / icon-512.png; pixel-verified
  emerald-dominant, gold present.

## Deployment

- Enabled Pages on `main` → https://ucfzem.github.io/al-jawab-al-kafi/ (all assets 200).
- Works link tree: inserted **الداء والدواء at position 13** (المدهش stays at 12 — the
  middle pair for 24 entries), renumbered 14–24, subtitle «24 projets publics», JSON-LD
  sequential 1–24 (validated `new Function` + JSON.parse). Emoji 💚.
- Root `sw.js` APPS allowlist: added `al-jawab-al-kafi`.
- Site repo commit `106cf05`.

## Verification (Playwright)

- Title «الداء والدواء (الجواب الكافي) — لابن القيم», h1 الداء والدواء, ابن القيم subtitle.
- 116 chapters, SW controlled, manifest registered, FontAwesome renders.
- Search online «الدعاء» → "18 فصل", 18 result rows; offline «المعاصي» → "29 فصل", 29 rows.
- Offline reload works: h1 + 116 chapters + emerald dark header render offline.
- Fonts: all 14 CDN woff2 → HTTP 200; `document.fonts.check('16px Cairo')` true;
  Cairo metrics confirmed (narrow-vs-Arial width); 37 fonts loaded. The 14
  `ERR_FAILED` webfont console noise is a benign SW pre-cache race artifact and is
  identical on al-mudhish.
- Note: initial probe used a wrong selector (`input[type=search]` instead of
  `#search-input`) and reloaded offline before the SW was active — both false alarms,
  corrected in the final verification.

## Links

- https://ucfzem.github.io/al-jawab-al-kafi/ (new app)
- https://ucfzem.github.io/al-mudhish/ (المدهش — unchanged, pos 12)
- https://ucfzem.github.io/works/ (24 projects, الداء والدواء at 13)
- https://github.com/ucfzem/al-jawab-al-kafi

## Sandbox Notes

- `timeout`, background `&` jobs, `ps` are unreliable here; run node scripts in the
  foreground without `timeout`.
- This conversation continues the al-mudhish/search/offline/gold sessions documented in
  `conversation-2026-10-13-al-mudhish-search-linktree.md` and earlier backups.