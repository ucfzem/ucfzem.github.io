# Conversation — 2026-10-20 — al-jawab-al-sahih (new PWA + full 6-volume text + works integration)

## Objective
Publish `https://ucfzem.github.io/al-jawab-al-sahih/` — *الجوابحيح لمن بدل دين المسيح*
(Ibn Taymiyyah) as a full offline-capable PWA in the library, then replace the scaffold with the
**real 6-volume text** (Shamela book 170, طبعة دار العاصمة), styled **exactly like al-bishara**.

## Decisions confirmed by the user
| Topic | Decision |
|---|---|
| Slug | `al-jawab-al-sahih` |
| Content | Multi-volume JSON: `data/manifest.json` + `data/vol_N.json` — **now filled with the full book** (6 vols) |
| Integration | **Full** — root `sw.js` `SHELLS`+`APPS`, card in `works/index.html`, icons in `works/sw.js` |
| Typography | Site's self-hosted **Cairo** (UI/Latin) + **AmiriPara** (Arabic paragraphs); no Google Fonts; `text-align: start` |
| Section on works | **Maktaba folder** (always unlocked), own icon |
| Look & feel | **Same theme/fonts/colors as `al-bishara`** — parchment/green/orange palette, solid green header |
| Languages | **Flags**: 🇲🇦 🇬🇧 🇫🇷 🇪🇸 pills; UI localized in 4 langs, book content = Arabic source |

## Text source & import (completed)
- Source: `https://shamela.ws/book/170` → reader `https://read.shamela.ws/book/170/<id>`, ids **1–2831**
  (server-rendered, fully vocalized). Crawl: `/tmp/opencode/crawl_shamela170.py` →
  `pages.jsonl` = **2831 pages, 0 failures** (vol pages {1:390, 2:446, 3:502, 4:497, 5:477, 6:519}),
  226 section titles, 10,079 paragraphs. Assembled to `al_jawab_al_sahih.txt` (5.95 MB) with
  ` الجزء N` markers + `@@HEAD: <section>` lines.
- `tools/build_chunks.py` patched (3 changes): `@@HEAD:` → chapter headings; wider paragraph flush
  (`.،؛؟!»)"'` or ≥700 chars); localized manifest titles (الجزء الأول…/Volume/Tome/Volumen);
  **+ `content_langs` auto-detect** from generated files on disk.
- Output: **6 volumes → 226 chapters → 358,280 words** (~5.9 MB JSON):
  vol_1 42ch/44,309w · vol_2 36/58,553 · vol_3 77/68,616 · vol_4 12/73,890 · vol_5 34/53,695 · vol_6 25/59,217
- Scaffold `vol_1.{en,fr,es}.json` **deleted**; `manifest.content_langs = ["ar"]` → language switch
  localizes the **UI** and renders the **Arabic source** (no 404 probes). Dropping in `vol_N.en.json`
  + listing `en` in `content_langs` activates translations.

## App changes in this session (`cd6fe0e`)
- **Real text** volumes + manifest (above).
- **Diactritic-insensitive search** (the source is fully vocalized, so `الله` must match `اللّه`):
  `normalizeText()` strips tashkeel + folds alef/hamza forms (`أ إ آ ٱ→ا`, `ة→ه`) while keeping an
  **index map back to the original glyphs**, so `<mark>` highlights land on exact vocalized text.
  Works in the counter, badges, chapter list and offline.
- **al-bishara theme, verbatim**: `#fdfbf7` parchment / `#2e6f40` green header & titles /
  `#f6ad55` orange highlights; dark `#12181b` / `#48bb78` / `#86efac` — identical token values,
  solid green app bar (no frosted glass), green-start bars on chapter items & reading card,
  bishara focus rings; `manifest.json` `theme_color #0f5c5a`, `background_color #12181b`.
  `fonts.css` was already byte-identical to bishara's.
- **Flag language pills** 🇲🇦 🇬🇧 🇫🇷 🇪🇸 (native-name `title`/`aria-label`, white-on-green active state).
- `sw.js`: `jawab-v1.0.0` → **`jawab-v1.1.0`**, CORE now precaches **all 6 volumes** + manifest;
  root `sw.js`: `DATA_MARKER` `v32` → **`v33`** (forces re-mirror of the new file list).

## Rejected plans (user pasted AI-generated code twice, earlier)
1. Google Fonts CDN + hardcoded `bookData` + `justify` + unescaped regex/`innerHTML`, no SW.
2. "Unified" merge with the same flaws (`system-ui`, pills that never load content, single SW).
Fact-check against claim #1: real `al-bishara` fetches `data/chapters{,.en,.fr,.es}.json`, loads
`locales/*.js`, has 0 `fonts.googleapis` refs, registers both SWs.

## Tests (all after the final deploy)
| Suite | Result |
|---|---|
| `test-jawab-local.mjs` | **66/66** |
| `test-jawab-live.mjs` (production, cache-busted) | **66/66** |
| `test-i18n.mjs` (regression) | **51/51** |
| `test-book-i18n.mjs` (regression) | **21/21** |
| `live-4lang.mjs` (regression) | **16/16** |
| `live-titlecolor.mjs` (regression) | **4/4** |

66 checks include: 6 volumes (labels localized+chapter counts), bishara **token-by-token parity**
(light/dark read from the live `al-bishara/style.css`), green header/parchment/colors, flags,
diacritic search (`المسيح` → matches + real vocalized glyphs `الْمَسِيح`), `((` safety, no HTML
injection, volume switching, 4 languages online **and offline**, offline vol_6 (25/25), fonts
offline, A± persistence, deep-link, drawer, works card, **zero online 404s**, zero page errors.
- `live-font.mjs` 0/4 remains a **stale assertion** written before commit `83aeb3f` (demands Cairo
  for `.card p`; paragraphs are intentionally `AmiriPara`).

## Commits
| Commit | Content |
|---|---|
| `01c5dd5` | new app + root SW + works card/icons + DATA_MARKER v32 |
| `f54e0f4` | app bar, language pills, A-/A+, match badges, hash deep-links |
| `cd6fe0e` | **full 6-volume text (226 ch, 358k words), diacritic-insensitive search, al-bishara theme + flag languages, SW v1.1.0, root marker v33** |
| (this) | conversation log + refreshed backup (30 files) |

## Known gaps / next steps
- **No translations yet** (`content_langs: ["ar"]`): EN/FR/ES show localized UI + Arabic source.
  Machine-translation pipeline (like `translate-book.mjs` for al-bishara) is the follow-up.
- vol_4 has only **12 chapter anchors** — Shamela's section titles are sparse there and the source
  contains **no in-text** `باب/فصل` heading lines, so 226 anchors is the reliable maximum.
- Full-book DOM render is not virtualized; each chapter renders on demand (fine for chapter-sized units).

## Links
- App: https://ucfzem.github.io/al-jawab-al-sahih/
- Works (Maktaba): https://ucfzem.github.io/works/
- Data: https://ucfzem.github.io/al-jawab-al-sahih/data/manifest.json (6 vols, 226 ch, 358,280 words)
- This log: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION_2026-10-20-al-jawab-al-sahih.md
- Commits: https://github.com/ucfzem/ucfzem.github.io/commit/cd6fe0e · https://github.com/ucfzem/ucfzem.github.io/commits/main
- Backup: https://github.com/ucfzem/ucfzem.github.io/tree/main/backups/al-jawab-al-sahih-2026-10-20 (30 files, byte-identical to pushed tree)

---

# Addendum — same day: full translations, chapter nav, SW runtime-cache fix

## Translations (EN / FR / ES) — all 6 volumes
- **678 translated chapters** (226 × 3 langs), ~1.9M chars per language; manifest now carries
  `content_langs: ["ar","en","es","fr"]` and per-volume `langs` (complete files only — the reader
  gates on `effectiveLang(volId)` so a language renders only where its file is complete).
- Pipeline (`al-jawab-al-sahih/tools/`): `translate-volumes.mjs` (resumable, atomic per-chapter
  writes), **`clientPool.mjs`** (Client Rotator & Cooldown Manager — per-client 429 cooldowns,
  Retry-After, fair round-robin, soonest-cooldown recovery), **`gtx.mjs`** (URL/payload layer:
  PayloadError → sentence-split retry smaller; PoolError → hard pause instead of hammering),
  **`verify-translations.mjs`** (structural check + Arabic-contamination repair gate).
- Verify gate result: **116 damaged paragraphs found, 116 repaired, 0 structural issues** across
  27,366 paragraphs checked (damage came from the earlier rate-limit death-spiral era).
- gtx bucket facts observed: rate limits are **per-`client=` bucket AND size-sensitive**; rotating
  across `gtx,at,dict-chrome-ex,surface,gtx-sr,ras` with per-bucket cooldowns kept throughput
  alive (dict-chrome-ex carried the load; others cooled 30→120s and recovered).

## Service worker: runtime-cache clone-race bug (fixed, v1.1.2)
- Since v1.1.0 the fetch handler did `caches.open(CACHE).then(c => c.put(req, res.clone()))` —
  the clone ran **inside the async callback, after the renderer consumed the body** →
  `Response body is already used` → the put silently died. Only install-precached files ever
  cached; runtime-cached (translated) volumes were unavailable offline.
- Fix: clone **synchronously** in the first `.then`, key by `req.url`, `.catch(() => {})`;
  `CACHE = 'jawab-v1.1.2'` (activate deletes the old jawab-* cache). Verified end-to-end:
  first online visit caches `vol_N.{en,fr,es}.json`; offline reload reads **pure translation**
  (Arabic share 0.00 for all three langs).

## UI: prev/next nav + mobile header
- التالي/السابق chapter nav (`#prevChapter/#navPos/#nextChapter` below the scroll area — survives
  content wipes): flat book navigation with cross-volume boundaries (vol_1 last ↔ vol_2 first),
  disabled only at true book ends; labels localized in all 4 languages.
- Mobile header single-row fix confirmed by measurement at 360×740: flex + nowrap + space-between,
  title↔burger center delta **0px**, title 1 line with ellipsis, no horizontal overflow,
  A-/A+ hidden ≤600px.

## Tests — local 92/92 green, live mirror updated
- `test-jawab-local.mjs`: **92 passed, 0 failed** (incl. translated online+offline reads for
  en/fr/es, nav suite incl. cross-volume + book-end disabled, mobile header rows, works card +
  icon load wait, diacritic search, fonts offline, zero page errors, zero failed requests).
  Suites now `process.exit(fail ? 1 : 0)` (failures were previously invisible to automation),
  wait for the SW to claim the page before translated fetches (uncontrolled fetches bypass the
  SW and never cache), and cache-bust the manifest read (`?cb=`).
- Works card icon is a live absolute URL — asserted after a bounded `img.complete` wait.

## Backup refresh
- `backups/al-jawab-al-sahih-2026-10-20/` (19M, byte-identical to working tree): full app
  (incl. 18 translated volumes + tools + progress files), root `sw.js`, and the complete
  `works/` tree (hub icons/parameters) per request.

## Links (current)
- App: https://ucfzem.github.io/al-jawab-al-sahih/ (ar/en/fr/es — 🇲🇦🇬🇧🇫🇷🇪🇸)
- Works (Maktaba): https://ucfzem.github.io/works/
- Manifest: https://ucfzem.github.io/al-jawab-al-sahih/data/manifest.json?cb=latest (4 langs, 6 vols, 226 ch)
- Example translated data: https://ucfzem.github.io/al-jawab-al-sahih/data/vol_1.en.json
- Backup: https://github.com/ucfzem/ucfzem.github.io/tree/main/backups/al-jawab-al-sahih-2026-10-20

## Post-launch verification (same day, after `b876322` went live)
- Live suite rerun against https://ucfzem.github.io/al-jawab-al-sahih/ : **92/92 passed**
  (translated offline reads arShare 0.00 ×3, nav labels localized, works card + icon).
- Nav-label localization confirmed live in a fresh browser:
  EN Previous/Next · FR Précédent/Suivant · ES Anterior/Siguiente · AR السابق/التالي.
- Samsung A5-class profile (360×640, Galaxy S5 UA, live site): labels localize correctly,
  prev/next nav visible, no horizontal overflow. User-reported "Arabic labels on phone" was a
  **stale client cache** (pre-deploy page in an open tab / old SW shell) — resolution:
  pull-to-refresh twice (SW updates first, fresh HTML second). App JS audited for old-WebView
  compatibility: no `?.`, `??`, `replaceAll`, or other post-ES2017 syntax in index.html.
- No tree changes were needed post-launch; this addendum is the only new commit.
