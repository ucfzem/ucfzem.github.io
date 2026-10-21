# Conversation — 2026-10-21 — izhar-al-haqq (new PWA: إظهار الحق, Rahmatullah al-Hindi)

## Objective
Publish `https://ucfzem.github.io/izhar-al-haqq/` — **إظهار الحق** (Sheikh Rahmatullah
al-Hindi, AH 1280 / CE 1864) as a static offline-capable PWA, **same architecture, design and
fonts as al-jawab-al-sahih**, with a 4-language UI (ar/fr/en/es), real-time global search with
highlights + result navigation, favorites, reading-position resume, 3 themes, and PWA offline
support — using the **exact JSON schema the user specified**. Then register it in
`works/index.html` **Maktaba folder (unlocked section)** with its own icon.

## Decisions confirmed by the user
| Topic | Decision |
|---|---|
| Slug | `izhar-al-haqq` |
| Schema | **Single file** `data/izhar-al-haqq.json`: `{book:{…, translations:{ar,fr,en,es}}, chapters:[{id,number,title,titles:{ar,fr,en,es},sections:[{id,heading,content[]}]}]}` — built exactly |
| Book metadata | Verbatim as given (incl. es author `Jeques Rahmatullah al-Hindi`, es title `Izhar al-Jaq (La Verdad Revelada)`, en `Izhar ul-Haqq (The Truth Revealed)`); `total_chapters: 8` (real count) |
| Content language | **Arabic only** (content translations not requested); UI localized ×4, chapter titles translated ×4 |
| Look & feel | Same as al-jawab-al-sahih (bishara parchment/green family) + **3rd sepia theme** |
| Typography | Same as jawab: self-hosted **Cairo** (UI) + **AmiriPara** (Arabic paragraphs), offline-safe — overrides the prompt's Google Fonts mention |
| Search | User's `escapeRegExp`/`<mark class="highlight">` snippet adapted to **DOM-safe** `fillHighlighted()` (diacritic-insensitive, index-mapped to original glyphs) |
| Integration | works Maktaba card + root `sw.js` `SHELLS`+`APPS` (same as jawab) |
| Icon | New custom `icon.svg`: library-style green book + gold starburst (“manifestation of light”); `icon-192/512.png` rendered from it via Playwright |

## Source & import (completed)
- Source: `https://shamela.ws/book/22721` (Mallaawi ed., 4 parts). Reader pages render ~300–1000
  chars/id → **scrape all 1321 pages** with `/tmp/opencode/scrape22721.mjs` →
  `izhar_text/shamela22721.json` = 3225 paras, 1,105,365 chars, **0 empty** (pages 457–472
  repaired via curl + merge; Playwright repair was flaky). Extraction cross-checked against the
  browser `nass` innerText on ids 100/300/457/458/459/700/1000 → **±3 chars** (whitespace only).
- Section sub-TOCs: `GET https://shamela.ws/ajax/titlechilds/22721/{id}` for nodes
  2,11,249,367,403,443,473 (تمهيد is a leaf) → `toc_child_*.html` with exact page anchors.
- Official TOC: 8 chapters — تمهيد p1 · المقدمة p8 · الباب 1 p95 · 2 p412 · 3 p610 · 4 p649 ·
  5 p741 · 6 p955 → 1321.
- Builder `/tmp/opencode/izhar_text/build_izhar.mjs` (kept in scratch, not deployed):
  - Page ranges per chapter; paragraph-level marker splitting (المقدمة's first three أمور all
    anchor **page 8**, so the marker must sit inside the page-8 paragraph).
  - `cleanParas`: drops digit-only paras, dedups `[إظهار الحق]` book marks, merges orphan
    fragments (<30 chars, no terminal punctuation) into the following paragraph.
  - Chapter titles translated ar/en/fr/es (embedded CHAPTERS table).
- Output: **8 chapters · 37 sections · 3138 paragraphs · 1,105,452 chars → 2,014,577 bytes**,
  no warnings.

## App (this session)
- `index.html` — jawab-style split layout: header (lang pills 🇲🇦🇬🇧🇫🇷🇪🇸, A±, 3-state theme
  button), sidebar (search + stats, **result nav `‹ 0/N ›`**, All/Favorites chips, chapter list
  with per-chapter match badges + ★), sub-bar star, reader (`h2` chapter, section `h3`s),
  prev/next nav.
- `app.js` — i18n ×4 (incl. per-language book title/author from `book.translations`), favorites
  `izhar_favs` (localStorage), resume `izhar_pos`, theme `izhar_theme` (light→dark→sepia),
  lang `izhar_lang`, font size `izhar_font_size`, hash deep-links `#chapterId` + resume
  fallback, global search capped at `MAX_RESULTS=20000` with flat results and
  `gotoResult()` (cross-chapter jump, current hit `mark.highlight-current`), dual SW
  registration (`./sw.js` + `/sw.js`, app SW wins its scope).
- `style.css` — jawab tokens verbatim + sepia palette + favorites/result-nav/section styles.
- `sw.js` — `izhar-v1.0.0`, CORE precaches app shell + `data/izhar-al-haqq.json` + 12 fonts,
  runtime-puts with **synchronous clone** (no race), activate filters `izhar-` prefix only.
- `manifest.json` — izhar names, `theme_color #2e6f40`.
- Fonts copied byte-identical from jawab (`fonts/` 12 woff2 + `fonts.css`).
- Root `sw.js`: added `izhar-al-haqq` to **SHELLS** and **APPS** (bare-URL redirect + offline
  shell fallback for works/home visitors).
- `works/index.html`: one line — Maktaba array entry after al-jawab-al-sahih:
  `{ emoji: "🌟", name: "إظهار الحق", tag: "Islamic Studies", icon: …/izhar-al-haqq/icon.svg, url: … }`
  → renders inside `#f-maktaba` in the always-unlocked `#publicProjects` container.

## Tests
| Suite | Result |
|---|---|
| `test-izhar-local.mjs` (repo on :8099) | **102/102** (incl. font-size controls header + sidebar, mobile reachability) |
| `test-izhar-local.mjs` (production, cache-busted) | **102/102** — offline translated reads (en/fr/es arShare 0.00), offline search + result nav, works Maktaba icon, mobile header + sidebar font controls, 0 page errors/404s |

## Font-size controls (added after launch)
User: *"must add +A A- font size buttons"*. The buttons existed but were **hidden on ≤600px**
(`#fontMinus,#fontPlus{display:none}`) — invisible on the user's phone. Fixed:
- Header `A-` / `A+` now **always visible** (compact at ≤600px, no longer hidden).
- New **sidebar font-size row** (`#fontSizeGroup`): label `حجم الخط` + `A−` `#fontMinus2` / live value
  `#fontSizeValue` / `A+` `#fontPlus2` — always reachable on mobile via the ☰ drawer.
- `app.js`: shared `stepFont(delta)` / `currentFontSize()` used by all four buttons; the size label
  stays in sync; persists to `izhar_font_size` (12–30px clamp). i18n label/titles ×4
  (ar: حجم الخط/تصغير الخط/تكبير الخط; en: Font size/Smaller/Larger; fr: Taille du texte/Réduire/Agrandir;
  es: Tamaño de letra/más pequeño/más grande).
- CSS: `.font-size-row`, `.size-btn`, `.font-size-value` added (uses existing theme tokens, works in
  all 3 themes); `A-` uses the `A−` (minus sign) glyph.
- Cache-bust: `app.js?v=3`, `style.css?v=2`, SW `izhar-v1.2.0`.

## Paragraph translations (EN/FR/ES) — added after launch
User reported the same gap as the Ibn Taymiyyah book: *"only index and titles are translated, no paragraph translation"*.
Fixed by adapting the jawab translation pipeline to the single-file schema:
- `tools/gtx.mjs` + `tools/clientPool.mjs` — reused verbatim from al-jawab-al-sahih (multi-client rotation, per-client
  429 cooldowns, Arabic-echo detection). Output: `data/izhar-al-haqq.{en,fr,es}.json` — **identical structure**
  (same book, chapter ids, section ids, paragraph counts/order), only `sections[].heading` + `sections[].content[]` translated.
- `tools/translate-izhar.mjs` — resumable at **paragraph granularity** (output file is ground truth, atomic write per
  paragraph); the 3 languages run **concurrently through the shared ClientPool** so the synchronous rotation hands each
  in-flight request a different bucket while cooldown state stays shared.
- `tools/verify-izhar.mjs` — quality gate: structural parity + no Arabic-dominant entries; repairs damaged entries in place.
  Final: **0 damaged, 0 structural issues** across all three languages.
- One stubborn paragraph (chap-4-s2 #17, a 901-char run of quoted Genesis verses) kept tripping the engine's
  Arabic-echo heuristic; translated it directly in smaller pieces → **0.00** Arabic share.
- `data/izhar-al-haqq.json`: added `book.content_langs = ["ar","en","fr","es"]`.
- `app.js`: `ensureContent(lang)` loads `izhar-al-haqq.<lang>.json` **only when `book.content_langs` lists it**
  (no 404 probes) with a **strict chapter-count shape guard** (partial files fall back to Arabic rather than render
  misaligned); `switchLanguage()` re-fetches content + rebuilds search results; boot restores translated content for a
  saved language. Cache-bust `app.js?v=2`.
- `sw.js`: `izhar-v1.0.0` → **`izhar-v1.1.0`**; CORE now precaches the 3 translation files too.
- Live proof: chapter 1 renders ar 100% / en,fr,es 0.00 Arabic in body text; English reads fully **offline** (357k chars, 0.00).

## Files (deployed)
`izhar-al-haqq/` = index.html · style.css · app.js · sw.js · manifest.json · fonts.css ·
fonts/×12 · icon.svg · icon-192.png · icon-512.png · data/izhar-al-haqq.json ·
data/izhar-al-haqq.{en,fr,es}.json · tools/{gtx,clientPool,translate-izhar,verify-izhar}.mjs.

## Links
- App: https://ucfzem.github.io/izhar-al-haqq/
- Data (AR): https://ucfzem.github.io/izhar-al-haqq/data/izhar-al-haqq.json
- Data (EN): https://ucfzem.github.io/izhar-al-haqq/data/izhar-al-haqq.en.json
- Data (FR): https://ucfzem.github.io/izhar-al-haqq/data/izhar-al-haqq.fr.json
- Data (ES): https://ucfzem.github.io/izhar-al-haqq/data/izhar-al-haqq.es.json
- Works card: https://ucfzem.github.io/works/ (Maktaba · المكتبة, unlocked)
- Source: https://shamela.ws/book/22721

## Commits
- `26f21d8` izhar-al-haqq: full book PWA + works Maktaba card + root sw SHELLS/APPS entry
- `cd9fbd5` izhar-al-haqq: EN/FR/ES paragraph translations + content_langs gate + SW v1.1.0 + toolchain/verify gate
- `10258af` conversation: izhar-al-haqq notes (translations)
- `037733e` izhar-al-haqq: always-visible A-/A+ font-size controls (header compact + sidebar row) + SW v1.2.0
