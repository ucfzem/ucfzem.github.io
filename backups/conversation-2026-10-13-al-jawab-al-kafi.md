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
---

## Addendum — Maktaba folder in the link tree (same session)

User request (with check-notes): create an **unlocked** folder in the link tree
(https://ucfzem.github.io/works) named **Maktaba**, library/book icon, containing all
Arabic book links.

Clarified with the user (they invited questions):
- Quran apps (Quran Majeed v3 / Quran Reader / Quran Amp) stay in the main grid.
- Maktaba folder sits **in the middle of the grid**.
- Remaining webapps renumbered 1–14.

### What changed (only `works/index.html`, commit `a3b351a`)
- `publicProjects` = 14 webapps, renumbered 1–14 (Quran apps + Tanger/Blog/Lingotech/
  MicroInvoice/Droppy/Rafeeq/WebHealth/ElixirTech/EmailCollector/API JobFinder/
  SavoirsEnJouant).
- New `maktaba` array = 10 Arabic books, ordered with **المدهش (5) and الداء والدواء (6)
  at the center**:
  Al-Istibsar, Al-Adhkiya, الطب النبوي, Nuzhat al-Mushtaq, المدهش, الداء والدواء,
  أسرار الكون, كتاب العظمة, Tarikh Ibn Khaldun, Mujam al-Buldan.
- `renderPublic()` renders the folder after card 7 → **7 webapps before, 7 after
  (Maktaba exactly in the middle)**. Folder markup reuses the existing `.folder` styles
  (📚 icon, title «Maktaba · المكتبة», count 10, `toggleFolder('maktaba')`), rendered
  with `class="folder open"` → **visible to everyone, no unlock needed**.
- JSON-LD itemListElement rebuilt: 24 items, sequential 1–24 (webapps 1–14, books 15–24).
- Checked after applying: icon present (📚 closed-book/library), access = Public
  (in `#publicProjects`, outside `.locked`), middle placement confirmed.

### Validation (Playwright, live)
- 24 total cards, subtitle «24 projets publics», folder open by default.
- Folder 📚· count 10; books list correct with المدهش/الداء والدواء in the middle.
- Grid numbers sequential 1–14; folder exactly mid (7 before / 7 after).
- Toggle works (close/reopen); locked section unchanged (still locked, folders intact).
- Inline scripts 2/2 syntax OK; JSON-LD sequential; 0 page errors.
- No other file touched; app repos unaffected.

---

## Addendum 2 — Maktaba row visual fix (same session, commits `c4b7a2a`, `4a5d27e`)

Reported: the Maktaba row's right badge was a raw count ("10") instead of a category
tag, and the icon/title were misaligned ("trespassing the left") vs the cards.

Diagnosed by measuring live layout:
- Cards are responsive (base `padding 14px 16px / gap 12px`, then per breakpoint up to
  `22px 28px / gap 20px`) and start with a 24px `.card-num` column + gap before the icon.
- `.folder-header` was fixed `12px 16px / gap 10px`, had no number-column spacer, and
  `.folder-icon` was only `1rem` with no min-width → folder icon 46px and title 74px too
  far left at 1280px.
- Badge was `.folder-count` → "10" (a counter), unlike `.card-tag` category badges.

Fix:
- `.folder-icon` → `font-size:1.3rem; min-width:28px; text-align:center` (matches
  `.card-emoji`/`.card-icon`); added `.folder-num { min-width:24px }` spacer.
- Base `.folder-header` → `padding:14px 16px; gap:12px` (matches `.card` base) and added
  a matching `.folder-header { … }` rule inside **every** media query that styles `.card`
  (≤480, 768–1023, 1024–1439, ≥1440, ≥1920).
- `.folder { margin-bottom: 10px }` (matches `.card`).
- `renderPublic` Maktaba markup: added `<span class="folder-num"></span>` to the header
  and to each inner book card, replaced `<span class="folder-count">10</span>` with
  `<span class="card-tag">Library</span>`.
- Disclosure arrow floated into the right gutter (scoped `#f-maktaba` only, so the
  locked folders are untouched): `#f-maktaba .folder-header{position:relative}`,
  `#f-maktaba .folder-arrow{position:absolute;right:2px;top:50%;transform:translateY(-50%)}`,
  `#f-maktaba.open .folder-arrow{transform:translateY(-50%) rotate(180deg)}`.

Verified live at widths 1280/1024/900/768/600/400: folder icon, title, and inner-card
icon/name all align with the grid cards (delta 0px), badge reads **Library** and its right
edge aligns with the card tags (delta 0px), arrow sits in the gutter with no overlap,
0 console errors. Locked section unchanged; only `works/index.html` modified.

Safety note: the user asked for care ("lost 26 websites" previously) and suggested a
branch/backup; we worked on `main` in a git repo (full history → revertable), validated
inline scripts + JSON-LD before each push, and touched only `works/index.html`.

---

## Addendum 3 — Maktaba folder repositioned under Tanger d'Antan, numbered 5

Requested: move the Maktaba folder directly beneath **Tanger d'Antan** and give the folder
the number **5**.

Changes (only `works/index.html`):
- `renderPublic`: `const split = 4;` so the grid renders apps[0..3] → folder → apps[4..13].
- Folder header number span: `<span class="folder-num"></span>` → `<span class="card-num">${split + 1}</span>`
  (reuses the grid's Cinzel `.card-num` style, so it looks identical to the other numbers).
  Inner book cards keep the empty `.folder-num` spacer.
- Renumbered `publicProjects` to leave slot 5 for the folder: first four apps keep 1–4,
  the remaining ten shift to 6–15 (UcfZem Tech Blog 5→6 … SavoirsEnJouant 14→15).
- JSON-LD unchanged (24 sequential items; webapp relative order and books are unchanged).

Live-verified (fresh Playwright load of https://ucfzem.github.io/works/):
1 Quran Majeed v3 · 2 Quran Reader · 3 Quran Amp · 4 Tanger d'Antan ·
**5 Maktaba (folder)** · 6 UcfZem Tech Blog · 7 Lingotech · 8 MicroInvoice · 9 Droppy ·
10 Rafeeq · 11 WebHealth · 12 ElixirTech · 13 EmailCollector · 14 API JobFinder · 15 SavoirsEnJouant.
Folder index 4, number "5", preceded by Tanger d'Antan, followed by UcfZem Tech Blog.

Deploy note: the push to `main` succeeded immediately (commit `40a31dd`), but the GitHub
Pages CDN stayed stale for several minutes and the first Pages build appeared stuck
("building"); a fresh build was requested via `POST /pages/builds`, after which the live
edge served the new markup. Only `works/index.html` changed; locked section untouched.

---

## Addendum 4 — Mapamundi deep-zoom viewer (new app) + link-tree card + offline PWA

Requested: take the final OpenSeadragon viewer version, add it to the link tree in the
unlocked section **just under Maktaba**, choose a good icon, then push/deploy/backup/share.

### New app: `mapamundi/`
- `index.html` — standalone single-file viewer (OpenSeadragon **5.0.1** via jsDelivr CDN).
  Full-viewport dark antique theme (`#1e1e1e`), bottom-right **navigator**, mouse-wheel +
  pinch/drag gestures, minimalist overlay toolbar (zoom in/out, Home reset, navigator toggle,
  fullscreen), responsive, keyboard nav. A `CONFIG` block documents swapping between a `.dzi`
  tile set, a single image, a IIIF `info.json`, or multiple pages; default is a public
  CORS-enabled demo so it works out of the box; `open-failed` shows a friendly setup overlay.
- `icon.svg` (+ `icon-192.png`, `icon-512.png`) — gold globe + navigation route/compass on the
  dark theme (PNGs rendered from the SVG via Playwright; pixel-checked: gold 20231 / dark 216802).
- `manifest.json` — name "Mapamundi Viewer", standalone, theme `#1e1e1e`, any/maskable icons.
- `sw.js` — offline app shell (`CACHE = 'mapamundi-cache-v1.0.0'`): precaches `./`, `index.html`,
  `manifest.json`, icons + OSD CDN JS/control images (opaque); navigate = network-first→cache,
  same-origin network-first→cache, cross-origin cache-first→network. Cleans only `mapamundi-*` caches.
- `index.html` registers the SW on `load`.

### Link tree (`works/index.html`) — only file changed + root `sw.js`
- Inserted a **Mapamundi** card (🌐 fallback emoji, custom icon `/mapamundi/icon.svg`, tag
  "Geography", url `/mapamundi/`) into `publicProjects` right after Tanger d'Antan, i.e. directly
  under the Maktaba folder row. It takes number **6**; the following apps shift: UcfZem Blog 7,
  Lingotech 8, MicroInvoice 9, Droppy 10, Rafeeq 11, WebHealth 12, ElixirTech 13, EmailCollector 14,
  API JobFinder 15, SavoirsEnJouant 16.
- Subtitle `24 projets publics` → `25 projets publics`.
- JSON-LD: Mapamundi inserted at position 5, all 25 items renumbered sequentially.
- Root `sw.js`: added `'mapamundi'` to the `APPS` allowlist (offline bare-URL redirect).

### Safety & verification
- Only additive changes; edited files were `works/index.html` + root `sw.js` (+ the new folder).
  Every edit done via a script that asserts a single match and re-validates all inline scripts
  and the JSON-LD (`new Function` per script, `JSON.parse` on ld+json). `git diff` reviewed before commit.
- Local: `node --check` on both service workers; manifest JSON parsed; offline test with a real
  service worker PASSED (registered/active, page controlled, offline reload served the shell —
  viewer+toolbar+OSD present, no error, no page errors).
- Live (fresh Playwright): works grid = `1 Quran Majeed v3 · 2 Quran Reader · 3 Quran Amp ·
  4 Tanger d'Antan · [Maktaba #5] · 6 Mapamundi · 7 UcfZem Tech Blog … 16 SavoirsEnJouant`;
  mapamundi page loads (viewer/canvas/navigator/OSD, manifest linked, SW controlling);
  `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png` all HTTP 200; 0 page errors.

Commits: `443a3cf` (new mapamundi app), `f8d8e32` (works card + root sw allowlist).

---

## Addendum 5 — Mapamundi: real Monte 1587 map + 4-language UI

Reported: the viewer showed the OpenSeadragon demo (Florence Cathedral) instead of the map,
and a 4-language switcher was requested.

### Real tile source (deep zoom, not a 585 MB download)
- Investigated `iiif.davidrumsey.com/.../303661/info.json` → host does not resolve (invalid).
- Found the David Rumsey "dr_" items mirrored on the **Internet Archive**, which serves a
  CORS-enabled IIIF Image API v2 (`access-control-allow-origin: *`).
- Chose the main composite: id `dr_composite-map-of-tavola-1-60-map-of-the-world-10130085`
  → IIIF `info.json` reports **61,461 × 62,461 px** (~3.8 gigapixels), tile size 2048,
  scale factors 1…512, profile level2 with `cors`.
- `CONFIG.sources` now defaults to:
  `https://iiif.archive.org/image/iiif/2/dr_composite-map-of-tavola-1-60-map-of-the-world-10130085%2F10130085.jp2/info.json`
- IMPORTANT clarification: the huge `.jp2` (585 MB) is only the archive master; the viewer
  never downloads it. OpenSeadragon streams small tiles on demand — measured: 512² ≈ 3.6 KB,
  1024² ≈ 12.8 KB, 2048² ≈ 49.7 KB, detailed 1024² ≈ 260 KB; info.json ≈ 994 B. So no 585 MB
  file and nothing heavy to store; offline caching (SW) stores only tiles actually viewed.
- Fallback CORS-friendly source noted: Wikimedia Commons copy (3000×3004, `Special:FilePath`).

### 4-language switcher (EN 🇬🇧 / FR 🇫🇷 / SP 🇪🇸 / AR 🇲🇦)
- Added an inline language group to the toolbar (segmented pills; labels hide on mobile, flags remain).
- `I18N` dictionary translates title, subtitle, hint, and button titles/labels.
- `setLanguage()` sets `<html lang>` + `dir` (Arabic → `rtl`), updates `[data-i18n]` text and
  `[data-i18n-title]` titles, and persists choice in `localStorage('mapamundi_lang')`. Arabic
  title uses an Arabic serif fallback; active pill highlighted in gold.
- Kept OpenSeadragon 5.0.1 and the existing polished UI (did NOT adopt the pasted snippet that
  pointed to a non-existent local `./assets/urbano-monte-1587.jpg` and OSD 4.1).

### Verification
- Local (served) + live (Playwright): Monte IIIF opens (no error), canvas + navigator present,
  4 language buttons; AR → `dir=rtl`, lang=ar, Arabic title «خريطة العالم», home label «الرئيسية»;
  FR → "Visionneuse Mapamundi"; EN restores. 0 page errors. Rendered the 3.8 GP source through
  the same path OSD uses (small tiles) → confirmed light.

Commit: `f21cd2f` (mapamundi/default to Monte 1587 + language switcher).

---

## Addendum 6 — Mapamundi: interactive pins, info panel, credit, hotspots

### Interactive translated map pins
- Added `PINS` array (normalized image coords `x/y` 0..1) → OpenSeadragon overlays
  (`viewer.addOverlay`) rendered as gold `.map-pin` dots on the `open` event.
- Clicking a pin opens a translated bottom-sheet card (`.pin-card`) with the note in the
  current language; pins: North Pole, title & dedication, ocean & sea monsters, Terra Australis.
- Code: commit `37a3318`.

### Always-visible multilingual info panel (bio + notes)
- Replaced the modal with a persistent left-side `.info-panel`, **visible by default**, with a
  header toggle (chevron) and the toolbar **ℹ️** button both collapsing/expanding it.
- Panel content: `INFO` object (`title/credit/bio/revisions[]`) + a "Map notes" list built from
  `PINS`; fully re-rendered on language change. RTL-correct (Amiri font, mirrored padding).
- Loader now reveals on first `tile-loaded` (not on `open`), with a global 18 s fallback so a slow
  IIIF server or offline mode never leaves an opaque loading screen. Base loader tuning:
  `immediateRender: true`, `imageLoaderLimit: 10`, `timeout: 60000`, plus
  `<link rel="preconnect">` to `iiif.archive.org` / `cdn.jsdelivr.net`.
- SW cache bumped to `mapamundi-cache-v1.0.1`.
- Code: commit `20d5e71`.

### Expanded content + UcfZem credit + quick-nav hotspots
- Replaced `ABOUT` with `INFO` using the user's expanded EN/FR/ES/AR copy and the credit line.
- **"Made by UcfZem in 2026"** shown two ways: a gold `.credit-badge` in the panel and a
  persistent `.credit` watermark at the bottom of the screen. Both translate with the language
  (FR «Conçu par UcfZem en 2026», ES «Creado por UcfZem en 2026», AR «صُممت بواسطة UcfZem عام 2026»).
- **Quick-navigation hotspots** (`.hotspots` bottom-left): 🧭 North Pole, 🗾 Japan, ⛵ Southern
  Ocean, 🖼️ Sheet 58 → `zoomToRegion(x, y, zoom)` (`HOTSPOTS` block; coordinates approximate,
  North Pole = image centre). Labels hide to icons on mobile.
- `manifest.json` name → "Mapamundi — Urbano Monte (1587)".
- Did NOT touch `works/index.html` (the Mapamundi card already exists as #6, under Maktaba);
  did not adopt the suggested `work-item` snippet (would duplicate / risk the grid).
- Code: commit `897160b`.

### Verification (local + live, Playwright)
- Info panel visible by default; title "Mapamundi · Urbano Monte (1587)"; credit badge + watermark
  "Made by UcfZem in 2026"; 4 revisions, 4 map notes, 4 hotspots, 4 pins; toggle + toolbar button
  collapse/expand; ocean hotspot recentres the viewport; AR → `dir=rtl` + translated credit/title;
  0 page errors; offline app-shell test PASSED (SW v1.0.1).

Commits: `37a3318` (pins) · `20d5e71` (info panel + loader) · `897160b` (bio/credit/hotspots).

---

## Addendum 7 — Mapamundi: David Rumsey provenance section

- Added a provenance block to the info panel: heading + text explaining the 400-year
  preservation of the 60 sheets and the 2017 David Rumsey / Stanford digital stitching
  into the ~10-foot North-Polar planisphere.
- New `INFO[lang].provHeading` / `INFO[lang].provText` keys (EN/FR/ES/AR) rendered into
  `<h3 id="prov-heading">` + `<p id="prov-text">` (new `.info-body h3` style), between the
  revisions list and the "Map notes" list; re-rendered on language change.
- Live-verified: EN "The David Rumsey Digital Restoration", FR "La restauration numérique
  de David Rumsey", AR «مشروع ديفيد رومزي للترميم الرقمي» (RTL); credit + 4 hotspots intact;
  0 page errors.

Commit: `24c2479`.

---

## Addendum 8 — Mapamundi compass + portfolio credit

- Added an interactive **compass button** to the App controls bar: an SVG needle whose
  `#compass-needle` span counter-rotates on OpenSeadragon's `rotate` event (`rotate(-deg)`)
  so it always points true North; a single click resets the view.
- Enabled rotation (`showRotationControl:false`, `degrees:0`, `gestureSettingsTouch.pinchRotate:true`)
  and translated the tooltip (new `I18N.<lang>.compass`) in EN/FR/ES/AR.
- Made the click reset **deterministic**: `viewport.setRotation(0, true)` + `viewport.goHome(true)`
  + a 60 ms re-assert, so a zoomed/panned/rotated view snaps back to North + home without the
  concurrent-animation race (previously `setRotation(0)` + `goHome()` could leave it turned).
- Bumped the service worker cache to `mapamundi-cache-v1.0.2` so the updated shell propagates.
- Works grid: added an **optional** `p.credit` line to the `card()` template (`.card-credit`),
  set only on the Mapamundi entry (`name:"Mapamundi · Urbano Monte (1587)"`, `credit:"Made by
  UcfZem in 2026"`); all other 24 cards unchanged (25 cards total).
- Live-verified: rotate 55° + zoom 3.5 → click → rotation 0, zoom home 0.65, needle 0°;
  works page shows exactly 1 credit line, 25 cards, 0 page errors.

Commits: `e3a6521` (compass + credit), `7c43b22` (deterministic reset + SW v1.0.2).

---

## Addendum 9 — Mapamundi: full offline map (option 2)

- Generated a downscaled single-image copy of the same planisphere with `sharp`
  (libvips) from the 609 MB / 61461×62461 Internet Archive JPEG, using
  shrink-on-load + `sequentialRead` (RAM-safe): `assets/urbano-monte-1587.webp`,
  **12800×13008, 22.8 MB** (quality 80, effort 1). A 15000px/effort-4 attempt timed
  out under the 700 MB RAM cap; 12800px finished in ~19 s.
- Viewer: added `OFFLINE_SRC = { type:'image', url:'./assets/urbano-monte-1587.webp' }`.
  On load it picks the local image when `!navigator.onLine`, otherwise the streaming
  IIIF source; the `open-failed` handler now retries with the local image before
  showing the error box. Pins/hotspots still align (identical aspect ratio).
- Service worker: added the WebP to `CORE` (precached on install) and bumped
  `CACHE` to `mapamundi-cache-v1.0.3`.
- Local verification (SW on http://127.0.0.1): precached the WebP, went offline,
  reloaded → `navigator.onLine=false`, loader hidden, `world.getItemCount()===1`
  (local image), 4 pins, 4 hotspots, error box hidden, 0 page errors.
- Live: https://ucfzem.github.io/mapamundi/assets/urbano-monte-1587.webp returns
  HTTP 200 `image/webp` `content-length: 23959116`.

Note: on Android the cached copy lives only inside the browser's private storage
(`Android/data/com.android.chrome/...`), not a user-visible folder; to keep the file
directly, download it from the URL above.

Commit: `f80c078`.

---

## Addendum 10 — Mapamundi: offline black-at-deep-zoom fix

- Symptom (user, offline on Android): zooming past a certain level showed a black map.
- Cause: OpenSeadragon's single-image source (`type:'image'`) pre-renders the picture
  onto a canvas the size of the full image before slicing tiles. The 12800 px top level
  exceeded many phones' max canvas/texture size, so shallower levels showed but the
  deepest level rendered black.
- Fix: regenerated the offline copy at **4096×4163 (2.72 MB)** — within every phone's
  canvas limit and cheap to decode (~2.8 MB precache instead of 23 MB). Same aspect
  ratio, so pins/hotspots still align. Bumped SW cache to `mapamundi-cache-v1.0.4`.
- Verified locally (offline reload): precached 2 849 478 bytes; OpenSeadragon's map
  canvas (not the info panel) keeps real content (stdev ≈ 28.4) at home and zooms
  4/8/16 — no blank frames.
- Live: `assets/urbano-monte-1587.webp` → HTTP 200, `image/webp`, 2 849 478 bytes.

Commit: `604ef41`.

## Addendum 11 — Mapamundi: tiled DZI offline map (3×, readable) + coordinate picker + North-Pole fix

- Follow-up to #10: the 4096 px offline copy fixed the black but the user reported it was
  "so blurred we can't read minimum of text", then asked to make it "3× this actual size".
- A 3× *single* image (12288 px) reintroduces the black bug, so the offline copy was rebuilt
  as a **Deep Zoom pyramid**: `assets/offline/map.dzi` + `map_files/`, **12288×12488 px**,
  tile 1024, overlap 0, JPEG q82 → **225 tiles, ~34 MB**. Replaces the old
  `assets/urbano-monte-1587.webp` (deleted).
- **Key gotcha (cost the most time):** OpenSeadragon **5.0.1** computes a DZI's `maxLevel`
  as `ceil(log2(max(width,height)))` and *ignores the tile size* (see `tilesource.js`
  `this.maxLevel = … Math.log(Math.max(width,height))/Math.log(2)`). So level 0 must be the
  ~1-px thumbnail and the full image sits at **level 14**, not level 4. My first generator
  numbered folders dzsave-style (level 0 = 768 px), so OSD requested levels 7–14, got 404s,
  and rendered black. Fix: renumber the existing levels `0..4 → 10..14` and add the ten tiny
  single-tile levels `0..9` (`fix_dzi_levels.mjs`). Verified OSD then requests level-14 tiles.
- `index.html`: `OFFLINE_SRC = './assets/offline/map.dzi'` (was `{type:'image', url:…webp}`);
  offline/`open-failed` fallback now opens the DZI. `sw.js`: `CORE` precaches `map.dzi` + all
  225 tiles; cache bumped to **`mapamundi-cache-v1.0.5`**; install concurrency 8.
- **Verified offline** (Playwright persistent context, `--use-gl=angle --use-angle=swiftshader`):
  238 entries precached; offline reload renders; deep zoom (`zoom 18.82 / maxZoom 19.2`) loads
  level-14 tiles; map canvas **stdev ≈ 30.1, mean ≈ 131** (real content, **not black**);
  4 pins + 4 hotspots; 0 errors. Note: hardware-less headless Chromium fails WebGL
  (`MAX_TEXTURE_IMAGE_UNITS null`) and shows a black canvas — a test artifact only; software
  SwiftShader WebGL is required to screenshot correctly.
- **Hidden coordinate picker** (`?pick` in the URL): click the map to print the image-space
  `x% / y%` on a badge; `.map-pin` are made click-through so the map centre is tappable.
  Implemented at the viewer-creation site in `index.html`. Used to locate the rose centre.
- **North-Pole pin correction:** pin anchoring was already exact (`dx=dy=0`; OSD stores
  viewport coordinates, so there is no aspect-ratio bug and `translate(-50%,-50%)` centres it),
  so the only issue was the stored coordinate. User read the compass-rose centre in pick mode as
  **x = 49.95 %, y = 50.78 %** → `PINS.pole` and `HOTSPOTS.pole` now `x:0.4995, y:0.5078`
  (was `0.5, 0.5`).
- Commits: `007fc10` (tiled DZI offline), `ba265aa` (coordinate picker), `b22d374` (North-Pole
  alignment).
- Live: `assets/offline/map.dzi` → 200 (187 B); `assets/offline/map_files/14/5_5.jpg` → 200
  (273 678 B).

## Addendum 12 — Offline library apps on ANY device (root-SW shell cache) + works icons

- Reported: from the works page (card opens a **new tab**), three books — المدهش
  (al-mudhish), أسرار الكون (asrar-al-kawn), كتاب العظمة (al-adhama) — would not open
  offline, and **neither would their icons**. User requirement (explicit): they must open
  offline on **other devices too** (phones, laptops, TVs, tabs), i.e. *without* having to
  open each app online first on that device.
- Diagnosis:
  - Each app is a **separate project-page repo** (`ucfzem/al-mudhish`, `…/al-jawab-al-kafi`,
    `…/asrar-al-kawn`, `…/al-adhama`, etc.), each with its own `sw.js` scope `/app/`.
  - The apps themselves are fine: in isolation each installs its SW and then serves offline
    (verified). But an app only works offline **after that device has visited it online once**
    — which is exactly what the user is trying to avoid.
  - The `works` SW **never cached the app icons** (only its own `works/assets/*`), so the
    library card icons fell back to the browser HTTP cache and broke offline.
- Fix:
  1. **`sw.js` (root, scope `/`)** — now precaches, on install, the shell of all 10 library
     apps (`index.html` + `icon.svg` + `icon-192.png` + manifest) plus the shared CDN assets
     (Tailwind, Font Awesome CSS/webfonts, Google Fonts) and serves navigations to `/app/`
     from cache. It keeps the bare-URL (`/app`) redirect. When an app has its own installed
     SW, that SW takes precedence; the root SW is the fallback. New caches:
     `ucfzem-shells-v1`, `ucfzem-cdn-v1` (activate only prunes these two).
     `SHELLS` = al-tibb-al-nabawi, nuzhat-al-mushtaq, asrar-al-kawn, al-adhama,
     tarikh-ibn-khaldun, mujam-al-buldan, al-adhkiya, al-mudhish, al-jawab-al-kafi,
     livre-al-istibsar.
  2. **`works/sw.js`** — `works-v1.0.2`: added the 6 app icon URLs to `CORE` (nuzhat,
     mapamundi, al-mudhish, al-jawab-al-kafi, asrar-al-kawn, al-adhama) and stopped caching
     non-OK responses in the same-origin branch.
- Behaviour: once a device loads any page that registers the root SW (home or `/works`), it
  precaches ~5 MB and can then open every library app offline, fully styled (Tailwind/FA
  served from the CDN cache), **even if that app was never opened online**.
- Verified:
  - Local scaffold SW test: cold offline open of al-mudhish / asrar-al-kawn / al-adhama
    succeeded from cache.
  - **Live** (clean profile, only `/works` online → offline): `ucfzem-shells-v1` = 40 entries,
    `works-v1.0.2` = 16, `ucfzem-cdn-v1` = 5; all library card icons load offline (w>0); all
    four apps open cold offline with full content.
- Commit: `3f0d0be`.

## Addendum 13 — Offline book TEXT (tarikh 13 MB, mujam 10 MB) via works-triggered prefetch

- Reported: `tarikh-ibn-khaldun` "looks badly offline". Root cause: the shell/UI loaded
  (Tailwind from the CDN cache), but the **book text is fetched at runtime** from
  `data/manifest.json` + 29 chunk files (~13.3 MB); `mujam-al-buldan` similarly fetches
  `data/index.json` + 28 per-letter files (~9.7 MB); `livre-al-istibsar` is a Next.js export
  that pulls `/_next/...` chunks. The root-SW shell cache held only `index.html`, so offline
  the app showed "تعذّر تحميل بيانات الكتاب" (old: 293 chars vs 147 337 online).
- Fix:
  - **`sw.js` (root)** now handles a `postMessage({type:'prefetch-book-data'})`: it discovers
    and caches, for every `SHELLS` app, `data/manifest.json` → all `chunks[].file`,
    `data/index.json` → all distinct `file` entries, and every same-origin `src`/`href`
    referenced by `index.html` (covers Next.js chunks/fonts). Guarded by a
    `'/__bookdata-v1'` marker so it runs once. Content goes into `ucfzem-shells-v1`; the
    existing app-asset fetch branch then serves it offline.
  - **`works/index.html`** pings the root SW with that message once the root registration is
    `activated`. Only works-page visitors download the book data (homepage visitors just get
    the shells).
- Result: any device that opens **/works** online once can then read tarikh (and mujam) fully
  offline — even if the app was never opened online. ~23 MB extra, one time.
- Verified:
  - Local stub test (tarikh-like manifest+chunks): message → prefetch → offline full read.
  - **Live**: prefetch filled `ucfzem-shells-v1` to 82 entries (tarikh chunk-028 + mujam files
    present); offline `/tarikh-ibn-khaldun/` rendered 142 315 chars with **no** data error.
- Commit: `8a0447e`.

Note: heavy shell preload (`works-v1.0.2` icons, root `ucfzem-shells-v1` + `ucfzem-cdn-v1`)
plus the book data payload all key off `SHELLS` in `sw.js`; bump `DATA_MARKER` when book data
changes.

## Addendum 14 — Offline fix for `nuzhat-al-mushtaq` (relative + lazy local assets)

- Reported: `nuzhat-al-mushtaq` "No offline works".
- Root cause: the works-triggered prefetch only matched **absolute** `src`/`href`
  (`"/…"`). `nuzhat` loads its map metadata from **`./regions-meta.js`** (relative →
  skipped) and lazily injects **`./all-regions.js`** (1.7 MB full text) via
  `document.createElement('script')` at runtime, which is invisible to static tag parsing.
  Its Google Fonts URL also differed from the single cached superset.
- Fix (root `sw.js`):
  - `localRefs()` now resolves **relative and absolute** `src`/`href` (query preserved)
    and also quoted `".js"`/`".json"` literals inside inline scripts to app-local paths,
    then caches them.
  - App-asset cache lookups use `{ ignoreSearch: true }` so `?v=` variants resolve.
  - Added all four apps' **Google Fonts CSS** variants to the root CDN precache.
  - Bumped `DATA_MARKER` `v1 → v3` so devices that already prefetched re-run and pick up
    the newly-discovered files.
- Also now covered: `al-tibb-al-nabawi/script.js`, `al-adhkiya/all-adhkiya.js` +
  `audio/manifest.js`, `livre-al-istibsar/_next/**` (already), `mujam`/`tarikh` data.
- Verified live (offline, clean profile): title renders, **7 regions** metadata present,
  no data error, lazy `all-regions.js` loads from cache. Only remaining offline 404s are
  `fonts.gstatic.com` `.woff2` files (cosmetic font fallback; text unaffected).
- Known gap (not requested): `al-adhkiya` **audio MP3s** are listed in
  `audio/manifest.js` but are not precached (would add ~tens of MB); audio needs one
  online play, or ask to add them.
- Commits: `2e6fe91` (relative refs + ignoreSearch, marker v2), `8cd0cf3` (lazy-script
  discovery, marker v3), `83f35a1` (font CSS variants).

## Addendum 15 — Move `Remèdes` from locked → public (above WebHealth) + new icon

- Request: take `https://remedy-eight.vercel.app/` out of the **locked** list and put it
  into the **public/unlocked** list right above **WebHealth**, and change its icon picture.
- `works/index.html` structure: `publicProjects` ("Projets publics") and `lockedProjects`
  ("Projets verrouillés", unlocked by password). `renderPublic()` renders `publicProjects`
  with a `split=4`, then the `maktaba` folder (num 5), then the rest.
- Changes:
  - Removed the `Remèdes` entry from `lockedProjects` (was under `folder:'other'`).
  - Added `Remèdes` to `publicProjects` as **`num: 12`**, immediately above **WebHealth**;
    renumbered ElixirTech/EmailCollector/API JobFinder/SavoirsEnJouant to 14–17.
  - New custom icon **`works/assets/remedy.svg`** (green mortar-and-pestle with leaves,
    512×512, same style as `al-tibb-al-nabawi.svg`); the entry now uses it via
    `icon: "https://ucfzem.github.io/works/assets/remedy.svg"`.
  - Subtitle `25 → 26 projets publics`; JSON-LD `itemListElement` updated (Remèdes = 11,
    rest shifted, 26 items total).
  - `works/sw.js` bumped `works-v1.0.2 → works-v1.0.3` and `./assets/remedy.svg` added to
    `CORE` so the icon is precached offline.
- Verified live: `remedy.svg` 200 `image/svg+xml`; `works/sw.js` = `works-v1.0.3`;
  rendered page = 26 cards, `Remèdes` directly followed by `WebHealth`, icon `imgLoaded:true`,
  and `Remèdes` no longer present in the locked list.
- Commit: `92db367`.

## Addendum 16 — `Remèdes` app hosted at ucfzem.github.io/remedy/ + offline

- User clarified the Remèdes app lives in the repo at **`/remedy/`** (single,
  self-contained `index.html`, 176 KB; only external dependency is the Google
  Font **Alexandria**). It was online-only (linked from the card as
  `remedy-eight.vercel.app`).
- Changes:
  - **`remedy/sw.js`** (new, `remedy-v1.0.0`): precaches `./` + `./index.html`,
    fetches the Alexandria CSS with CORS (readable), parses its `gstatic` `woff2`
    URLs and caches them too; cache-first for same-origin and font hosts;
    network-first navigation with cache fallback.
  - **`remedy/index.html`**: registers `./sw.js` (app scope) and `/sw.js` (root).
  - **`works/index.html`**: Remèdes card + JSON-LD position 11 now point to
    **`https://ucfzem.github.io/remedy/`** (same origin → offline-capable).
  - **root `sw.js`**: added `remedy` to `SHELLS` and `APPS`, and the Alexandria
    CSS URL to the CDN precache.
- Verified live (clean profile):
  - ONLINE `/remedy/`: renders, `remedy-v1.0.0` cache = 7 entries (shell + CSS +
    4 `woff2`).
  - **OFFLINE** `/remedy/`: renders fully, font stylesheet served from cache,
    **no failed requests**.
  - Works page link + JSON-LD both show `https://ucfzem.github.io/remedy/`.
- Commit: `65bd2cb`.

## Addendum 17 — Systemic offline overhaul (all apps + sites offline from `/works/`)

- **Trigger**: user reported that many book apps / sites "work for a while offline
  then stop", and many "don't load at all offline or load in an ugly form with no
  links working".
- **Diagnosis** (`/tmp/opencode/test_audit.mjs`, two scenarios on a clean profile):
  - *Scenario A* (only `/works/` visited online): the 10 book shells + `remedy`
    loaded, but the same-origin **sites were completely dead offline**
    (`mapamundi`, `webhealth`, `droppy`, `childsgame`, `email-collector` →
    `ok=N`, `ERR_INTERNET_DISCONNECTED`), because they were absent from the root
    `SHELLS`/precache set. Fonts (`cairo`/`amiri` `woff2`) and `al-tibb`'s
    `chapters/ch-*.json` also failed → "ugly" + broken content.
  - *Scenario B* (each app opened online once): everything worked.
  - Root causes: (1) sites not prefetched; (2) app-local runtime files (tibb
    chapters, webhealth sub-pages, CDN fonts) never discovered by the root SW;
    (3) possible storage eviction → "works then stops".
- **Fix — root `sw.js`** (now `DATA_MARKER='/__bookdata-v4'`):
  - `SHELLS` extended with **`mapamundi`, `webhealth`, `droppy`, `childsgame`,
    `email-collector`, `quran-reader`, `quran-amp`, `api-job-finder`**.
  - New `assetRefs(text, s)` (extends old `localRefs`): resolves every `src`/`href`
    **and** any quoted string literal ending in a known asset extension (adds
    `.html/.css/.png/./jpg/.woff2/.mp3/…/.dzi`) → caches lazy files and multi-page
    links.
  - New **`syncAppSW(shell, cdn, s)`**: fetches each app's own `/app/sw.js` and
    mirrors its precache list — caches its local pages (e.g. `webhealth/*.html`,
    `droppy/get.html`) and its cross-origin CDN assets.
  - New **`cacheFontFiles(cdn, cssUrl)`**: fetches a Google-Fonts CSS with CORS and
    caches every `gstatic` `woff2` it references (opaque CSS alone can't render
    fonts). Uses `precache(...,3)` (retry) to limit gstatic flakiness.
  - `cacheAppData` now also reads `/<app>/manifest.json`; when it is an **array of
    `{file}`** (as in `al-tibb-al-nabawi`, 107 chapters) it precaches those files.
  - **`CDN`/`CDN_HOSTS`**: added `cdn.jsdelivr.net`, `unpkg.com`, and the exact
    per-app Google-Fonts CSS URLs (order-sensitive — Google keys CSS by full URL,
    so `mudhish`/`jawab`/`droppy`/`childsgame`/`email-collector`/`webhealth` needed
    their own URL strings verbatim).
  - `prefetchBookData` now runs every app **in parallel** (`Promise.all`) and
    finishes fonts in parallel too (sequential 19-app run couldn't finish in the
    old 45 s window).
  - **Multi-page navigation bug fixed**: offline navigation to
    `/webhealth/actualites.html` (path without trailing slash) used to hit the
    bare-URL redirect branch → served a redirect stub. Now any navigation whose
    path looks like a file (has an extension) is served from the mirrored cache.
- **`works/index.html` / `remedy/index.html` / `mapamundi/index.html`**: request
  **`navigator.storage.persist()`** on load, so cached shells/data survive storage
  pressure (mitigates the "works for a while then stops" eviction symptom).
- **Verified live** (`/tmp/opencode/test_focus.mjs` + `test_fonts.mjs`, 150 s
  prefetch window, clean profile, offline):
  - Scenario A: **all 16 apps `ok=Y`** (sites no longer dead); `al-tibb` renders
    with chapters; `mapamundi` boots OpenSeadragon (`map.dzi` + tiles cached);
    `webhealth` sub-page navigation works (`actualites.html`, correct title, not a
    redirect); book fonts `document.fonts.status='loaded'` with **no failed
    requests**.
  - Scenario B: all apps `ok=Y`, **zero failed requests**.
  - Remaining nit: a few decorative Google fonts (Playfair Display / Poppins /
    Baloo 2) occasionally not cached under burst → falls back to a default font
    (page still fully functional).
- Commits: `97fd4ce`, `53a1dec`, `7c3e0fb`, `6bc1d2d`, `3ee4a19`.
- Live: https://ucfzem.github.io/sw.js · https://ucfzem.github.io/works/

## Addendum 18 — `/works/` offline (root-SW fallback)

- Request: user wants `https://ucfzem.github.io/works/` itself to work offline.
- `/works/` already had its own SW (`works/sw.js`, `works-v1.0.3`) that precaches
  the shell + local `assets/*` and serves the cached `index.html` on offline
  navigation. Verified working on a clean profile: online visit → offline reload
  renders all 26 cards (`len 2100`, 14 images, 64 links, **no failed requests**).
- Hardening: added **`'works'` to the root `sw.js` `SHELLS`** so the root SW also
  precaches `/works/index.html` (+ icons/manifest) and mirrors `works/sw.js`'s
  CORE list — covering the edge case where only the root SW is active.
- Verified again after deploy: offline `/works/` clean.
- Commit: `801ce44`. Live: https://ucfzem.github.io/works/

## Addendum 19 — `/works/` cache-first hub + `quran-majeed-v3` offline

- Requests: (a) `/works/` itself must run offline (it is the hub — "no need of
  others running offline if works is not"); (b) `quran-majeed-v3` too.
- **`works/sw.js` → `works-v1.0.5`**: navigation changed from network-first to
  **cache-first with background revalidate** (serves the cached `index.html`
  instantly, updates it in the background when online). Verified offline with
  only **3 s** and **8 s** online visits: `/works/` and bare `/works` both render
  (`len 2135`, 65 links, **no failed requests**).
- **`quran-majeed-v3`** (separate repo `ucfzem/quran-majeed-v3`, linked from
  works). Its old SW only cached `['/']` (the origin root — wrong) and explicitly
  never cached the API responses the app is built from, so it had no real offline
  mode. Rewrote its `sw.js` (version `v3`):
  - precaches the shell `./` + `./index.html` + the Google-Fonts CSS;
  - `staleWhileRevalidate` for Quran data hosts
    (`api.alquran.cloud`, `api.quran.com`, `api.qurancdn.com`);
  - cache-first for font hosts; **audio + analytics left to the network** (avoids
    breaking Range/streaming);
  - **background prefetch** of the surah list and, for all 114 surahs, both
    `…/v1/surah/N/ar` and `…/v1/surah/N/quran-uthmani`.
  - Added `quran-majeed-v3` to the **root `sw.js` `SHELLS`/`APPS`** for the hub.
- Verified offline (clean profile): `#surahList` = **114** entries; opening a
  surah renders Arabic text (`#mainContent` 463 chars); title + offline banner
  correct; **no `alquran`/`quran.com` request failures**.
- **"Is 30 s online needed?"** — No app needs 30 s to *open* offline: the shells
  are precached at SW install (a few seconds). The heavy *content* (book text
  ~23 MB, mapamundi tiles ~34 MB, 114×2 Quran endpoints, fonts) is fetched by a
  **background** prefetch that keeps running and may take ~30–90 s; content that
  finished is already usable offline.
- Commits: main `54bc934`; quran-majeed-v3 `4a3f886`, `23cc112`.
- Live: https://ucfzem.github.io/works/ · https://ucfzem.github.io/quran-majeed-v3/

## Addendum 20 — Quran Majeed v3: tafsir available offline

- Question: "why can't we see tafsir offline?"
- **Root cause:** tafsir was fetched **on demand, per ayah**, from
  `…/tafsirs/…/by_ayah/{s}:{a}` and only cached by the SW **if that exact URL had
  been fetched online**. The background prefetch cached only the surah list and
  the Arabic text — not tafsir — so tafsir for ayahs/surahs you had never opened
  was simply absent offline (the app showed "❌ Impossible de charger le Tafsir").
- **Fix (app):** `index.html` now requests the **whole-surah bulk endpoint**
  `https://api.quran.com/api/v4/tafsirs/ar-tafsir-ibn-kathir/by_chapter/{surah}?per_page=300`
  (one request returns every ayah of the surah, indexed by `verse_key`), with the
  old per-ayah endpoints kept as fallback if the bulk call fails. Bonus: faster
  (1 request instead of N) and every ayah of a surah gets cached at once.
- **Fix (SW `v4`):** after the Arabic-text prefetch, a second background worker
  (3 concurrent) prefetches the same bulk tafsir URL for **all 114 surahs** into
  the data cache; `api.quran.com`/`api.qurancdn.com` are already
  stale-while-revalidate, so they are served offline.
- **Verified:** opening a tafsir online issued exactly **one** request
  (`…/by_chapter/1?per_page=300`) and rendered Ibn Kathir text; the data cache
  `qmv3-data-v4` held **114 `by_chapter` entries** (every surah) → tafsir is
  available offline. (The offline Playwright leg crashed on a context
  teardown quirk, not on app behaviour.)
- **Size:** ~1–3 KB/ayah; whole-Quran tafsir ≈ 15–25 MB (comparable to the
  mapamundi tile cache already held). It downloads in the background.
- Commit quran-majeed-v3 `1910235` (cache version `v4`).
- Live: https://ucfzem.github.io/quran-majeed-v3/

## Addendum 21 — Quran Majeed v3: tafsir offline for *all* surahs (real root cause)

- Report: **many** surahs had no tafsir offline (Al-Hajj was just one example).
- **Real root cause:** in `activate`, `prefetchQuran()` was called **without
  `await`** (`event.waitUntil((async()=>{ …; prefetchQuran(); })())`). The
  `waitUntil` promise resolved as soon as activation ended, so the browser was
  free to **terminate the SW immediately**, aborting the background prefetch
  partway — only the first few surahs ever got cached. The fetches themselves are
  fine: a standalone run cached **all 114 surahs / 18.9 MB in 2.7 s** with **0
  failures**.
- **Fix (SW `v5`):**
  - `await prefetchQuran()` inside `activate`'s `waitUntil` (SW stays alive until
    the prefetch finishes);
  - `putWithRetry()` (2 tries) and a **second tafsir pass** to fill anything
    missed/evicted;
  - a `message` handler: `{type:'cache-surah', surah:n}` caches that surah's text
    + tafsir immediately.
- **Fix (app):** `loadSurah()` now posts `{type:'cache-surah', surah:num}` to the
  SW, so the surah you actually open is cached for offline **right away**
  (independent of the background prefetch).
- **Verified live:** data cache `qmv3-data-v5` = **114 `by_chapter` entries**;
  Surah 22 (Al-Hajj) present **and valid** (exactly **78** tafsirs);
  `navigator.serviceWorker.controller = true`.
- Commit quran-majeed-v3 `e04b744` (cache version `v5`).
- Note: existing devices must let `v5` take over (one hard refresh); the ~19 MB
  tafsir set then downloads in the background in a few seconds.
- Live: https://ucfzem.github.io/quran-majeed-v3/

## Addendum 22 — `sifat-al-safwa`: full book (791 biographies) + Maktaba wiring

- Goal: replace the 4 sample entries in the `sifat-al-safwa` PWA with the **whole
  book**, wire it into the `works` "Maktaba" (unlocked) folder, and make it
  offline.
- **Source found (after the user's suggested path 404'd):** OpenITI hosts Ibn
  al-Jawzi (d. 597) under the period repo `OpenITI/0600AH`, folder
  `data/0597IbnJawzi/0597IbnJawzi.SifatSafwa/`. Three editions exist:
  `…Shamela0012031-ara1.mARkdown` (structured, used), `…JK000067-ara2`,
  `…ShamAY0033757-ara2`. Raw: `https://raw.githubusercontent.com/OpenITI/0600AH/master/data/0597IbnJawzi/0597IbnJawzi.SifatSafwa/0597IbnJawzi.SifatSafwa.Shamela0012031-ara1.mARkdown`
- **mARkdown structure:** `# ` = paragraphs (8432), `### |` large sections,
  `### ||` sub-sections / companion bios, `### |||` sub-sub, `### $ N- name` =
  numbered biographies (12+). Page markers `PageV\d+P\d+`, page notes `ms\d+`.
- **Parser** `/tmp/opencode/parse_sifat.mjs`: bio-start regex
  `^###\s+(?:\$|\|{1,3})\s*(\d+)\s*[-–.]`; tracks category from region headings
  (`أهل X`) + `الطبقة N`, defaulting to `أصحاب رسول الله`; inlines non-region
  sub-headings into the text wrapped in `⟪…⟫` and lists them in `sub_headings`.
  Output keys: `id,name,category,sub_headings,text,source_num`.
- **Result:** **791 biographies**, **2.93 MB**, all with `source_num`.
- **App (`index.html`) upgrades:** `⟪…⟫` → `<strong class="sub-mark">` (inline
  section headings); gold `📌` topic badges (`.sub-chip`) that scroll/flash the
  matching section; search now also matches `sub_headings`; copy uses the
  reference format (`المصدر/الترجمة/التصنيف`); share = Web Share API on mobile +
  WhatsApp/Telegram fallback on desktop; incremental paging (60 at a time,
  "تحميل المزيد"); `.body{white-space:pre-line}`.
- **Verified (Playwright, local + live):** 791 entries, initial 60 cards,
  "load more" 60→120, search "أبو مسلم الخولاني" → 1, Prophet card shows 68
  sub-badges + 68 inline markers, no console/page errors.
- **Wiring:** added `sifat-al-safwa` to root `sw.js` `SHELLS` + `APPS` and its
  font CSS URL to `CDN`; added a Maktaba card (📖 صفة الصفوة) after
  كرامات الأولياء in `works/index.html` (12 entries, inline scripts validated).
- Live: https://ucfzem.github.io/sifat-al-safwa/

## Addendum 23 — `sifat-al-safwa`: full book expanded to 1021 biographies

- The mARkdown edition was only 2 vols (791 bios). The **JK000067** edition is
  the full 4-vol text: **1011** numbered biographies (`# | N name`, max
  **#1031**). AY0033757 (823) used only to fill gaps.
- `/tmp/opencode/parse_full.mjs` merges the three editions:
  `mARkdown ∪ JK ∪ AY`, **JK wins** on overlap, **mARkdown supplies #1–#8**
  (Prophet + early Companions, which JK numbers from #9), **AY fills stragglers**.
- **Result: 1021 biographies, range 1–1031, 2.92 MB** (only 10 numbers absent in
  all three editions: 132,134,233,445,475,606,630,729,820,827).
- Re-verified: 1021 entries load, 60 initial cards, paging, search, sub-badges
  (68 on the Prophet card), no errors.
- Live: https://ucfzem.github.io/sifat-al-safwa/

## Addendum 24 — `sifat-al-safwa`: Nuzhat Al-Mushtaq dark theme

- Restyled to the Nuzhat Al-Mushtaq look by mapping its palette onto the app's
  **existing** design tokens (avoids replacing `<style>` and breaking class
  names/JS). Dark is now the default (both `[data-theme]` palettes set to it).
- Palette: bg `#121110`, card `#1c1a17`, border `#4a3e2c`, text `#d1c7b7`,
  muted `#8c8275`, emerald header `#2d5d46` (→`#26503c` gradient), gold
  `#c29b53`, sub-badges `#26221c`/`#c9b082`/`#4a3e2a`.
- Body text: Amiri, `1.35rem`, `line-height:2.2`. Header h1 `#f0e6d2`,
  sub-title `#8fb39b`. Card title gold. `theme_color`→`#2d5d46`
  (meta + manifest), manifest `background_color`→`#121110`.
- Verified (computed styles): body `#121110`, card `#1c1a17`/border `#4a3e2c`,
  title `#c29b53`, chip `#26221c`/`#c9b082`, body Amiri 21.6px/47.5px, no errors.
- Live: https://ucfzem.github.io/sifat-al-safwa/





## Addendum 25 — `sifat-al-safwa`: recover missed numbered entries + real paragraphs

- **Two parser gaps caused the count to stay low (1021):**
  - **Standalone-number lines** — JK prints some headings as a bare number on its
    own line, then the name on the next: `# 827` + `# | البيضاء بنت المفضل`.
    The regex (which required `# | N name` on one line) skipped them. Now handled
    via a pending-number state (a following unnumbered `# | name` line adopts it).
    Recovered **820 = عثامة**, **827 = البيضاء بنت المفضل** (also makes JK supply
    200, 609, 1026, 1030 with fuller text).
  - **Combined numbers** — one entry covering two people: JK `# | 605 ، 606 غضنة وعالية`
    and mARkdown `### $ 445، 446 - علي والحسن ابنا صالح بن حي`. Now split on the
    `و` conjunction into two entries sharing the narrative. Recovered **606 = عالية**,
    **445 = علي**.
- **Result: 1025 biographies, range 1–1031** (was 1021). Only **6** numbers remain
  absent from *all three* editions: **132, 134, 233, 475, 630, 729** (each is merged
  into a neighbor or sits in an order-shifted region in every source, so it is not
  separately extractable).
- **Paragraphs fixed at data level (`mergeParas`).** The source wraps text at the
  original line breaks, so entries were hundreds of one-line fragments. Now fragments
  are merged into real paragraphs:
  - break only on sentence-end punctuation `[. ؟ ? ! ۔ … » ”]`;
  - a trailing **`:` continues** (quoted speech follows — `قالت:` / `فقال:`);
  - **heading items (`⟪…⟫`) stay standalone** and are never glued to a neighbor;
  - safety cap: flush at ~1500 chars.
  - Example: entry #481 went from many fragments → **2** paragraphs; #745 → **4**.
- **Cache bump:** app SW `VERSION` `sifat-v1` → **`sifat-v2`** so the new
  `data.json` is fetched by returning visitors (app SW is cache-first on data).
- File: `sifat-al-safwa/data.json` (3.04 MB, 1025 entries); parser
  `/tmp/opencode/parse_full.mjs` (`mergeParas` + standalone/combined handling).
- Live: https://ucfzem.github.io/sifat-al-safwa/

## Addendum 26 — `sifat-al-safwa`: match nuzhat-al-mushtaq theme (fonts + palette)

- Fetched the **real** reference at `https://nuzhat-al-mushtaq.vercel.app/` and
  reconciled. Its CSS uses two families only — **Cairo** (UI/body) and **Amiri**
  (book text) — plus a specific token palette. The earlier "Nuzhat" pass had used
  a different invented palette and an `Aref Ruqaa` title, so it did **not** match.
- **Palette now copied verbatim** into the app's tokens:
  - **light** (`html[data-theme="light"]`): ink `#2b2118`, paper `#faf5e9`,
    panel `#f2e9d6`, green `#1f5c46`, gold `#a9792f`, line `#d8c9a8`,
    card `#fffdf6`, modern-card `#f1f6f2`, accent-text `#7c5620`, muted `#7a6a50`.
  - **dark** (default fallback): ink `#ece4d3`, paper `#16130e`, panel `#241f16`,
    green `#4e9a73`, gold `#d3a34a`, line `#3a3225`, card `#1e1912`,
    modern-card `#131b17`, accent-text `#d9b977`, muted `#9a8a6c`.
  - header text `#f5eeda`. App tokens remapped onto these
    (`--bg/--card/--text/--primary/--accent/--border` etc.).
- **Fonts:** UI stays **Cairo**; **book text = Amiri** at
  `calc(var(--content-font-size,1rem) * 1.15)` / `line-height:1.9` (was
  `1.35rem/2.2`); the `h1` is now **Cairo** (was Aref Ruqaa); `body`
  line-height `1.9`. Sub-chips tokenized (panel/line) so they theme correctly.
- **Theme default** now follows the OS like the reference's `themeBoot`: dark
  unless `prefers-color-scheme: light`. Added a matching **no-flash** inline
  `themeBoot` script in `<head>` (same `sifat-theme` key the app uses).
- **Meta/manifest:** `theme-color` → `#4e9a73` (dark) / `#1f5c46` (light) via JS;
  manifest `theme_color #4e9a73`, `background_color #16130e`. App SW → `sifat-v3`.
- **Verified (headless computed styles):** body `rgb(250,245,233)` light,
  card `rgb(255,253,246)`, header solid green `#1f5c46`, h1 font `Cairo`,
  `.name`/`.body` font `Amiri`, content `18.4px`/LH `34.96px` (~1.15·1.9),
  60 cards, **no console errors**.
- Live: https://ucfzem.github.io/sifat-al-safwa/

## Addendum 27 — `sifat-al-safwa`: show author + Hijri death year under the title

- The header already contained the author line, but it was **hidden on phones**
  by `@media(max-width:560px){ .titles p{display:none} }`, so the mobile view did
  not match the reference (which shows "الشريف الإدريسي" beside the title).
- Markup now: `<h1>صفة الصفوة</h1>` + `<p class="book-author">لابن الجوزي — توفي سنة 597 هـ</p>`.
- CSS: `.titles p.book-author{margin:3px 0 0; font-size:.95rem; font-weight:600;
  color:var(--header-text); opacity:.92}`; mobile keeps it visible
  (`.book-author{font-size:.88rem}`). Used `var(--header-text)` (#f5eeda) for
  readable contrast on the green header instead of the suggested `#52b788`
  (too low-contrast on the green).
- App SW → `sifat-v4` (so returning users get the updated header immediately).
- **Verified (headless, 1280px & 375px):** `.book-author` `display:block`,
  `visible:true`, text "لابن الجوزي — توفي سنة 597 هـ", color `rgb(245,238,218)`.
- Live: https://ucfzem.github.io/sifat-al-safwa/

## Addendum 28 — `sifat-al-safwa`: real offline bug — fonts fell back (wrong cache)

- **Root cause:** `install` precached the Google Fonts **CSS** (`FONT_CSS`) into the
  **SHELL** cache, but the fetch handler for `fonts.googleapis.com` reads the
  **RUNTIME** cache (`staleWhileRevalidate(RUNTIME, req)`). So offline the CSS
  `<link>` request was a cache miss → network → `net::ERR_FAILED`, and the app
  silently dropped **Amiri/Cairo**, falling back to system fonts. (Cards/search
  still worked, which is why it looked "fine".)
- **Fix:** in `install`, after caching CORE into SHELL, also
  `(await caches.open(RUNTIME)).add(FONT_CSS)` — same cache the fetch handler
  reads. App SW → `sifat-v5`.
- **Verified (local, fresh visit with no manual reload → offline reload):**
  failed requests while offline = **NONE**; `document.fonts.check('1rem "Amiri"')`
  = true, `Cairo` = true; 60 cards.
- Live: https://ucfzem.github.io/sifat-al-safwa/


## Addendum 29 — NEW app: `ajayib-al-makhluqat` («عجائب المخلوقات وغرائب الموجودات» — القزويني)

- Built a new offline PWA reader for al-Qazwini's cosmography and wired it into the
  `works` **Maktaba · المكتبة** (unlocked) folder.
- **Source:** Shamela book **30006** — زكريا بن محمد بن محمود القزويني (ت 682 هـ).
  Crawled all **398** pages via `https://shamela.ws/ajax/pageContent/30006/{id}`
  (JSON: `{nass, pageNum, title, prevId, nextId}`), following `nextId` 1→…→398.
- **Parser** (`build_qazwini_data.mjs`): cleaned the `nass` HTML — dropped copy
  buttons (`<a class="btn_tag">`), anchor spans, `<hr>`+`<p class="hamesh">`
  editorial footnotes, and standalone `(١)` footnote markers; kept `﴿﴾`, `[refs]`
  and `c5` lead-ins. Grouped pages into **128 sections** using the source `title`
  field (a bare «فصل» merges forward into the current section).
- **data.json:** 128 sections · 2687 paragraphs · 398 pages · ~1.14 MB (0.61M chars).
- **App** (`index.html`): Nuzhat/sifat palette+fonts, **dark by default** (per request);
  header «عجائب المخلوقات وغرائب الموجودات» + «لـ زكريا القزويني — توفي سنة 682 هـ».
- **Features:** theme toggle; full-text search with results counter
  («تم العثور على N نتيجة») + diacritics-aware `<mark>` highlights; font-size
  A− / A / A+ (localStorage); font-family selector (Amiri / Scheherazade New / Cairo);
  TOC drawer (128 entries); prev/next section; back-to-top; copy/share per section;
  last-reading-position restore.
- **PWA:** `sw.js` `ajayib-v1` (shell precache + Google Fonts **CSS into RUNTIME**,
  same fix as sifat-v5), `manifest.json` (theme `#4e9a73` / bg `#16130e`),
  `icon.svg` (celestial sphere) + `icon-192/512.png`.
- **Wired:** `works/index.html` `maktaba` (now **13** entries, `🪐 عجائب المخلوقات`,
  tag *Cosmography*); root `sw.js` `SHELLS`+`APPS` + ajayib font CSS in `CDN`;
  `DATA_MARKER` v7 → **v8** so clients that visited works before re-prefetch and
  pick up the new app.
- **Verified (local):** 128 sections render; search «السماء» → 72 results + 75 marks;
  TOC 128 links; A+ 1.15→1.25rem; theme toggles; offline reload → 128 sections,
  Amiri loaded; E2E from `/works/` → card online **and** offline, root SW cached the
  app shell+data, app opens offline.
- Live: https://ucfzem.github.io/ajayib-al-makhluqat/ · card in https://ucfzem.github.io/works/


## Addendum 30 — fix `ajayib-al-makhluqat`: TOC drawer overlapped the header & blocked taps (mobile)

- **Symptom (user screenshot):** on mobile the top bar looked overlapped — the
  TOC panel sat over the book title / search bar, and the ☰ فهرس button often
  would not open.
- **Root cause:** `.toc` was anchored with `inset-inline-end:0`, which in RTL
  resolves to **left:0**, and hidden with `transform:translateX(102%)`. On a
  320px viewport a `min(88vw,380px)` panel is ~281px wide, so `102%` (~287px) did
  **not** clear the screen — a sliver stayed on-screen over the header and, because
  it had `z-index:61`, it swallowed pointer events (headless: `#tocList`
  intercepts pointer events → `#tocBtn` click timed out).
- **Fix:** anchor the drawer physically `right:0`, hide with
  `transform:translateX(105%)` **plus** `visibility:hidden` (revealed on `.show`),
  with a staggered transition (`transition:transform .28s ease, visibility 0s linear .28s`)
  so the slide animation still plays but the closed panel is fully off-canvas and
  non-interactive. Removed the `html[dir="rtl"] .toc` transform override.
- **Verified (headless, 320/360/390):** CLOSED → `visibility:hidden`, panel
  `x=[334,616]` (fully past the viewport), `elementFromPoint(☰)` = the button;
  OPEN → `shown:true`, `visibility:visible`, docked flush right (`right = vw`).
  Full online/offline suite still green: 128 sections, search «السماء» → 72 results,
  TOC 128 links, offline reload 128 sections, Amiri loaded, no console errors.
- App SW → `ajayib-v2` (so returning users receive the fixed shell immediately).
- Live: https://ucfzem.github.io/ajayib-al-makhluqat/


## Addendum 31 — offline reliability on other devices + works card icon cache

- **User report:** «عجائب المخلوقات» would not open offline on *other* devices even
  after one online visit, and the card icon looked broken/loose on /works.
- **Diagnosis (headless, persistent two-session profile = real device reopen):**
  session 1 online cached correctly (shell 8 entries + runtime 25; `data.json`
  cached), session 2 offline rendered **128 sections, 0 errors** — the SW itself is
  fine. The smoking gun was `navigator.storage.persisted() === false`: the app never
  requested persistent storage, so under storage pressure (very common on mobile,
  esp. iOS/Android) the browser **evicts** the cache → later offline fails. Also
  the SW only registered on `window load`, so a quick open/close could interrupt
  install.
- **Fixes (app):**
  - call `navigator.storage.persist()` at startup (prevents eviction);
  - register the service worker **immediately** (no `load` wait) so install
    completes even if the tab is closed right away;
  - SW bumped `ajayib-v2` → **`ajayib-v3`** (shell `ajayib-shell-ajayib-v3`) so
    returning clients receive the updated `index.html`.
- **Fixes (works):** the offline works card icon was broken because
  `works/sw.js` CORE cached icons for the other apps but not this one. Added
  `sifat-al-safwa/icon.svg`, `ajayib-al-makhluqat/icon.svg` and
  `ajayib-al-makhluqat/icon-192.png` to CORE; bumped `works-v1.0.5` →
  **`works-v1.0.6`** (install re-precaches so returning users get the icon and the
  refreshed `index.html`).
- **Verified:** works card icon loads online (`complete:true, naturalWidth:512`);
  persistent profile session2 offline still renders the book; app + works SW
  versions bumped as above.


## Addendum 32 — offline works icons (Avatar, Quran Majeed v3, Tanger d'Antan)

- **User report:** offline, the works page lost the Avatar image and the
  «Quran Majeed v3» and «Tanger d'Antan» card icons.
- **Root cause:** those <img>s pointed at **cross-origin**
  `https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/works/assets/*.png`,
  while `works/sw.js` CORE precached the **same-origin** `./assets/*.png` — a
  *different* URL. So the CORE entries were never actually used by the cards, and
  the raw URLs only survived offline if they happened to be runtime-cached while
  the works SW was controlling (timing-dependent) → intermittent broken icons.
- **Fix:** repointed all 5 raw icon refs (avatar.png, quran.png, tanger.png,
  cv-icon.png, web-dev-logo.png) to the same-origin
  `https://ucfzem.github.io/works/assets/...` paths already in CORE → guaranteed
  precached → available offline. Patched via a guarded Node script (asserted
  exactly 5 replacements, re-validated every inline script + ld+json).
- **works SW** bumped `works-v1.0.6` → **`works-v1.0.7`** so returning clients
  re-install, re-precache CORE, and re-fetch the corrected `index.html`.
- **Verified:** all local assets 200; online + offline works card icons/avatar
  resolve from cache (no raw.githubusercontent references remain).


## Addendum 33 — new app: «المسالك والممالك» لابن خرداذبه (offline PWA)

- **طلب المستخدم:** تحويل ملف HTML قائم بذاته (تصميم مخطوط: رَقّ/ذهبي + نمط داكن،
  خطّا Aref Ruqaa و Amiri) إلى تطبيق كامل يعمل **أونلاين وأوفلاين**، وإدراجه بعناية
  في شجرة الروابط `/works` ضمن مجلد **المكتبة (maktaba)** مع اختيار أيقونة جيدة،
  ثم push/deploy/backup/روابط — مع التحذير المعتاد (سبق أن فُقد 26 موقعًا).
- **المصدر:** المكتبة الشاملة كتاب **11800**. زُحف كامل الكتاب عبر
  `https://shamela.ws/ajax/pageContent/11800/{id}` بمتابعة `nextId`
  (`/tmp/opencode/ibn_khordadbeh_pages.json` = **264 صفحة**). نُظّف بنفس محلّل
  القزويني (إسقاط `btn_tag` وأزرار النسخ، `anchor` spans، مؤشرات `c2` الرقمية،
  وفكّ الكيانات) مع دمج الصفحات المتتابعة المتطابقة العنوان في أقسام.
  **النتيجة: 116 بابًا/فصلًا · 554 فقرة · 264 صفحة · `data.json` = 412 KB.**
- **التطبيق** `/al-masalik-wa-al-mamalik/`: `index.html` (تصميم المستخدم نفسه:
  `--primary #8b0000` أحمر و`--accent #d4af37` ذهبي على رَقّ `#f7f1e3`، وعناوين
  Aref Ruqaa ونصّ Amiri؛ الافتراضي **فاتح/رَقّ** مع تبديل داكن)، بحث فوري + عدّاد
  («N نتيجة») + تظليل `<mark>` مع تطبيع الهمزات/التشكيل، فهرس جانبي دائم على
  الحاسوب وصندوق `aside` منسدل على الجوال (بإصلاح الـ TOC: `right:0` +
  `translateX(105%)` + `visibility:hidden`)، حجم الخط (أ−/أ/أ+)، نوع الخط
  (أميري/شهرزاد/القاهرة)، تنقّل سفلي (أعلى/سابق/تالٍ)، نسخ/مشاركة لكل باب،
  حفظ الموضع والمظهر والخط في localStorage (`masalik-*`)، `navigator.storage.persist()`
  وتسجيل SW فوري.
- **ملفات PWA:** `sw.js` (بادئة `masalik-`, النسخة `masalik-v1`؛ تخزين مؤقت للغلاف
  + `data.json` + خطوط gstatic؛ `index.html` ← الحلّ حين التنقّل)، `manifest.json`
  (theme #8b0000, bg #f7f1e3)، وأيقونة **بوصلة ذهبية على أحمر مخطوطي**:
  `icon.svg` + `icon-192.png` + `icon-512.png` (رُسِمت الـ PNG عبر **sharp**
  `dist/index.mjs` بدل Playwright لتجنّب تعليق الملفات).
- **الإدراج بعناية (إضافي فقط، مع تحقّقات):** سكربت `patch_wire_masalik.mjs`
  يتحقق من التطابق المفرد ويُعيد فحص كل `<script>` الداخلي و`ld+json`:
  - `works/index.html`: بطاقة جديدة «🗺️ المسالك والممالك» / tag Geography في
    `maktaba` (13 → **14** مدخلًا).
  - `sw.js` (الجذر): إضافة `al-masalik-wa-al-mamalik` إلى `SHELLS` و`APPS`،
    ورفع `DATA_MARKER` **v8 → v9** (يعيد التخزين المسبق للزوّار السابقين).
    ورد CSS الخطوط المطلوب موجود أصلًا في `CDN` (لا تغيير).
  - `works/sw.js`: إضافة أيقونة التطبيق إلى `CORE`، ورفع `works-v1.0.7 → v1.0.8`.
  - نسخ احتياطية قبل التعديل: `BAK2.works.index.html`, `BAK2.sw.js`, `BAK2.works.sw.js`.
- **التحقق (محلي حكومي ثم مباشر):** 116 بطاقة؛ بحث «الطريق» = 135 نتيجة/175 تظليلًا،
  و«بغداد» = 22 نتيجة؛ الفهرس 116 عنصرًا؛ الجوال: الصندوق يُفتح (right=vw) ويُغلق
  (visibility:hidden)؛ تبديل المظهر وحجم الخط؛ **أوفلاين: 116 بطاقة + Amiri محمّل،
  0 أخطاء** — على الحاسوب والجوال. Live: masalik-v1، data 412006b، works-v1.0.8،
  DATA_MARKER v9، بطاقة works ظاهرة.


## Addendum 34 — إصلاح فهرس «المسالك والممالك»: طيّ اللوحة (سطح المكتب + الجوال)

- **طلب المستخدم:** إصلاح سلوك لوحة الفهرس بحيث **يُغلق** بالنقر على باب أو بالنقر
  خارجها، ويُحرّر مساحة القراءة. أرفق المستخدم مقتطفًا عامًّا (بمعرّفات
  `#sidebar`/`#sidebarToggle`) لا يطابق التطبيق — تطبيقه حرفيًّا كان سيرمي
  `TypeError` (عناصر `null`).
- **التشخيص:** التطبيق **كان أصلًا** يغلق اللوحة عند اختيار باب (`#indexList` →
  `closeToc()` ثم `goSec`) وعند النقر على الحجاب (`#overlay` → `closeToc()`).
  لكن `:root` كان يعرض الفهرس **مثبّتًا/دائمًا** فوق ≥1025px، فظلّت المشكلة على
  **سطح المكتب**: اللوحة دائمة وتأكل 320px بلا طريقة لطيّها، والـ breakpoint كان
  `900px` فقط (أجهزة اللوحية العرضية 901–1024px بلا زرّ قائمة). أكّد الاختبار:
  عند العرض **1024px** كان `menuBtnVisible=false` والفهرس مثبّتًا.
- **القرار (بعد استيضاح):** المستخدم طلب جعلها **قابلة للطيّ على الحاسوب أيضًا**.
- **الإصلاح في** `al-masalik-wa-al-mamalik/index.html` (**تعديلات CSS فقط + تبسيط JS**):
  - `aside#index` صار **منسدلًا خارج الشاشة افتراضيًّا على كل المقاسات**:
    `width:min(86vw,360px); transform:translateX(105%); visibility:hidden;`،
    و`.show` يعيده (`translateX(0)`)، مع `transition` ناعم.
  - `.menu-btn` صار ظاهرًا على كل المقاسات (`display:inline-flex`)، ومثله
    `.side-close` (زرّ ✕).
  - أُزيل `main{margin-inline-end:320px}` → القراءة بعرض كامل (`mainW == viewport`).
  - حُصرت `@media (max-width:1024px)` في ضبط الحشو فقط (لا تغيير سلوكي).
  - بُسّط JS: `syncLayout()` يزامن `aria-hidden` مع حالة الفتح على كل المقاسات
    (أُزيل منطق `matchMedia` الخاص بالـ breakpoint).
- **التحقق المحلي** (`test_all_widths.mjs`، خادم 8300): على `375 / 768 / 820 /
  1024 / 1280 / 1440` — زرّ القائمة ظاهر، اللوحة مخفية افتراضيًّا، تُفتح، **تُغلق
  بالنقر على الباب** (مع الانتقال إلى القسم) و**بالنقر خارجها**، **0 أخطاء**.
  وأُعيد تأكيد **الأوفلاين** (`masalik-v2`): 116 بطاقة + نصّ القسم كاملًا.
- **النسخ/التخزين:** رُفعت `al-masalik-wa-al-mamalik/sw.js` `masalik-v1 → v2`
  (لتلتقط العملاء `index.html` الجديد). ورفع `DATA_MARKER` في `sw.js` الجذري
  `/__bookdata-v9 → v10` — لأن `install` في SW الجذر يُعاد تشغيله وإعادة تخزين
  غلاف التطبيق فقط عند تغيّر بايتات ملفّه؛ فرفع العلَمة يدفع إعادة التخزين المسبق
  لزوّار `/works` فقط (المسار الذي يخدم غلاف التطبيق). `works/sw.js` لم يتغيّر
  (لا تغيير أيقونات).
- **نسخ احتياطية:** `BAK3.masalik.index.html`, `BAK3.masalik.sw.js`, `BAK3.root.sw.js`.


## Addendum 35 — توسيع عمود القراءة على الحاسوب (desktop)

- **طلب المستخدم:** توسيع حاويّة النصّ في وضع الحاسوب لتملأ عرضًا أكبر من الشاشة.
- **الوضع السابق:** بعد إصلاح الطيّ (addendum 34) صار المحتوى بعرض كامل فعلًا، لكن
  الحاويّة الداخلية `.wrap` (وكذلك `footer` و`.ctrl-inner` في الترويسة) كانت
  محدودة بـ `max-width:820px` (و`900px` للترويسة)، فيبقى فراغ كبير على الشاشات
  العريضة.
- **الإصلاح في** `al-masalik-wa-al-mamalik/index.html` (**CSS فقط**): أُضيف
  `@media (min-width:1025px){ .ctrl-inner, .wrap, footer{ max-width:1180px } }`
  في نهاية الأنماط (لغلبة الترتيب في الشلال) — يوسّع عمود القراءة والترويسة معًا
  ليبقيا متراصفين.
- **ملاحظة تصميمية:** فضّلت `max-width` وحده دون `width:90%` (المقترح في المقتطف)
  لأن `width:90%` داخل `main` (الذي له حشو أفقي) يُنتج عرضًا أصغر قليلًا من
  الترويسة فيسبب اختلالًا طفيفًا في الترسي، بينما `max-width` وحده يحقّق التمدّد
  المرن حتى السقف مع تراصف تامّ.
- **التحقق المحلي** (`test_width.mjs`): على `1280 / 1440 / 1920` صار
  `.wrap = .ctrl-inner = .chapter-card = 1180px` متطابقة، `main` بعرض الشاشة،
  **0 أخطاء**؛ وأُعيد تأكيد **الأوفلاين** (`masalik-v3`): 116 بطاقة + نصّ القسم كاملًا.
- **النسخ/التخزين:** `al-masalik-wa-al-mamalik/sw.js` `masalik-v2 → v3`،
  و`DATA_MARKER` الجذري `/__bookdata-v10 → v11` (لدفع SW الجذر لإعادة تخزين
  غلاف التطبيق لزوّار `/works`). `works/sw.js` لم يتغيّر.
- **نسخ احتياطية:** `BAK3.masalik.index.html`, `BAK3.masalik.sw.js`, `BAK3.root.sw.js`
  (لقطة ما قبل addendum 34؛ التغييرات التالية محفوظة في git).


## Addendum 36 — «Remedy» (/remedy/): تحويله إلى PWA كامل يعمل أونلاين وأوفلاين

- **طلب المستخدم:** أن يعمل تطبيق `/remedy/` أونلاين **وأوفلاين** (مثل بقية التطبيقات).
- **التشخيص:** التطبيق كان **يعمل أوفلاين فعلًا**: كل بياناته مضمّنة داخل
  `index.html` (176KB) بلا أي `fetch`/`XHR`، وله Service Worker خاص
  (`remedy-v1.0.0`) يسجّل نفسه ويخزّن الغلاف + خطوط Alexandria، ويستدعي
  `navigator.storage.persist()`. تأكيد مباشر: 90 بطاقة أونلاين و**90 أوفلاين،
  0 أخطاء**. لكنه كان **ناقصًا لصفات PWA القابلة للتثبيت**: لا `manifest.json`،
  ولا `theme-color`، ولا أيقونات تطبيق، ولا وسوم Apple — لذا لا يظهر كتطبيق على
  الشاشة الرئيسية. (SW الجذر كان يحاول مسبقًا تخزين `/remedy/manifest.json`
  وأيقوناتها غير الموجودة.)
- **الإصلاح (إضافي، مع إبقاء التطبيق كما هو):**
  - `remedy/manifest.json` (اسم «🌿 Remedy — Remèdes de Grand-Mère»، `short_name`
    Remedy، `lang:fr`، `display:standalone`، `start_url/scope:./`،
    `theme_color:#708238` (لسان التطبيق)، `background_color:#fcfbf7`، و4 أيقونات).
  - أيقونة: نُسخت أيقونة بطاقة works نفسها `works/assets/remedy.svg` →
    `remedy/icon.svg` (هاون ومدقّة خضراء)، ووُلّدت `icon-192.png` و`icon-512.png`
    عبر **sharp**.
  - `remedy/index.html` (رأس الصفحة): إضافة `<link rel="manifest">`،
    `theme-color`، أيقونة SVG + `apple-touch-icon`، ووسوم
    `apple-mobile-web-app-*`. وتغيير تسجيل SW من `window load` إلى **فوري**.
  - `remedy/sw.js`: رفع `CACHE` `remedy-v1.0.0 → v1.1.0` وإضافة
    `manifest.json` + الأيقونات إلى `PRECACHE`.
  - `sw.js` (الجذر): رفع `DATA_MARKER` `/__bookdata-v11 → v12` لإعادة تخزين
    غلاف remedy المُحدَّث لزوّار `/works` (لا تغيير آخر — الجذر يخزّن مسبقًا
    `/remedy/manifest.json` وأيقوناتها ضمن `SHELLS`).
- **التحقق المحلي** (`test_remedy_local.mjs`، خادم 8500): manifest يُحمّل (4 أيقونات،
  standalone)، 90 بطاقة أونلاين، `icon-192` = 200، `theme-color=#708238`،
  و**أوفلاين: 90 بطاقة + الأيقونة مخزّنة (200)، 0 أخطاء**.
- **نسخ احتياطية:** `BAK4.remedy.index.html`, `BAK4.remedy.sw.js`, `BAK4.root.sw.js`.


## Addendum 37 — تطبيق «خريدة العجائب وفريدة الغرائب» (/kharidat-al-ajaib/) — ابن الوردي

- **طلب المستخدم:** بناء تطبيق قارئ لكتاب «خريدة العجائب وفريدة الغرائب» — ابن الوردي
  (مواصفات: ملف واحد، مظهر مخطوط، فاتح/داكن، خطوط أميري/شهرزاد/القاهرة، بحث + تظليل +
  عدّاد نتائج، فهرس RTL مع زر قائمة، دعم Smart TV ≤900px، JavaScript خام)، ثم وضعه في
  شجرة الروابط `works` ضمن قسم **Maktaba (غير المقفل)** مع بقية التطبيقات، بحذر، وأيقونة
  جيّدة، ثم push/deploy/backup ومشاركة الروابط.
- **تصحيح المصادر (كل مصادر المستخدم كانت غير صحيحة):**
  - مستودع GitHub `islamic-books/shamela-books` = **404**، والرابط الخام كذلك **404**،
    وعنوان `api.shamela.ws` = **بلا DNS** (curl 000)، و`shamela.ws/book/11833` = **404**.
  - الكتاب الصحيح على الشاملة هو **كتاب رقم 3298**، والمؤلف: **سراج الدين أبو حفص عمر بن
    المظفر بن الوردي، البكري القرشي، المعري ثم الحلبي (ت ٨٥٢هـ)** («المنسوب خطأً للقاضي
    زين الدين»). 480 ص، تحقيق أنور محمود زناتي، مكتبة الثقافة الإسلامية، القاهرة ١٤٢٨هـ.
  - واجهة الـ API الصحيحة: `https://shamela.ws/ajax/pageContent/3298/{id}` (الحقول:
    `nass, part, pageNum, title, nextId, prevId, pageId`).
- **الزحف:** `crawl_kharidat.mjs` → `/tmp/opencode/kharidat_pages.json` = **461 صفحة (480 ص)**.
- **بناء البيانات:** `build_kharidat_data.mjs` (تكييف باني ابن خرداذبه) → تنظيف HTML
  (إزالة الحواشي/أرقام الصفحات/`btn_tag`/`anchor`)، وتجميع الأبواب حسب العنوان المتكرر →
  `kharidat-al-ajaib/data.json` = **67 بابًا وفصلًا، 1613 فقرة، ~757KB** (424KB نصّي).
- **بناء التطبيق:** انطلاقًا من قارئ المسالك المُجرَّب (`index.html`)، بباتش مؤكَّد العدّ
  (`patch_build_kharidat.mjs`): العنوان والمؤلف والمصدر (كتاب 3298)، ولوحة ألوان مواصفات
  المستخدم (فاتح `#78281f`/`#b7950b`/`#fcf9f2`؛ داكن `#d98880`/`#f1c40f`/`#161513`)،
  وكل مفاتيح `localStorage` من `masalik-*` إلى `kharidat-*`.
  - **دعم Smart TV/لوحة المفاتيح:** `tabindex="0" role="button"` لعناصر الفهرس، تركيز
    أول عنصر عند الفتح، تنقّل الأسهم ↑/↓، تفعيل Enter/Space، ومفتاح Esc/رجوع (27/10009/461)
    يُغلق الدرج، وإطار تركيز مرئي `outline:3px solid var(--accent)`.
  - **أيقونة مميّزة:** `icon.svg` = كرة أرضية ذهبية على قرص رَقّي داخل مربّع عنّابي (تختلف
    عن بوصلة `المسالك`)، ووُلّدت `icon-192.png`/`icon-512.png` عبر **sharp**.
  - `sw.js` (خاص): `VERSION kharidat-v1` (تخزين مسبق للغلاف + data.json + الأيقونات + خطوط
    Google)، و`manifest.json` (اسم/وصف/أيقونات/`theme_color #78281f`).
- **الإدماج في works (بحذر، إضافي، بنسخ احتياطية):**
  - `works/index.html`: إضافة عنصر إلى `maktaba` (`📖 → 🌏 خريدة العجائب`, tag
    Cosmography, icon `/kharidat-al-ajaib/icon.svg`) → **14 → 15**.
  - `sw.js` (الجذر): إضافة `kharidat-al-ajaib` إلى `SHELLS` و`APPS`، ورفع `DATA_MARKER`
    `/__bookdata-v12 → v13` (لإعادة تخزين مسبق للغلاف + data.json). لا حاجة لتغيير `CDN`:
    عنوان خطوط Google المطلوب (مع Scheherazade New) موجود مسبقًا حرفيًّا.
  - `works/sw.js`: إضافة أيقونتَي kharidat إلى `CORE`، ورفع الكاش `works-v1.0.8 → v1.0.9`.
  - **نسخ احتياطية قبل التعديل:** `BAK5.works.index.html`, `BAK5.root.sw.js`, `BAK5.works.sw.js`.
- **التحقق المحلي:** `test_kharidat_local.mjs` (خادم 8931): 67 قسمًا أونلاين، بحث
  «الإسكندرية» (10 نتائج) وتظليل، فتح/إغلاق الفهرس + Esc + تركيز أول عنصر + تنقّل Enter،
  تبديل المظهر (`theme-color #161513`) والخط والحجم؛ و**أوفلاين: 67 قسمًا + بحث «بحر»
  (446 نتيجة)، 0 أخطاء**. `test_kharidat_widths.mjs`: لا تجاوز أفقي عند 375/768/820/1024/
  1280/1440/1920 وزر القائمة ظاهر في كلها. `test_works_local.mjs`: بطاقة kharidat ظاهرة في
  `/works/` والرابط صحيح والأيقونة 200 و0 أخطاء.
- **النشر والتوثيق:** كوميت **`495ffda`** على `main`، ورفع، وتشغيل بناء Pages → `built`
  (`495ffda`). تحقّق حيّ: `/kharidat-al-ajaib/` (عنوان صحيح)، `sw.js`=`kharidat-v1`،
  `manifest.json`=200، `data.json`=200 (757295 بايت)، `icon.svg/192/512`=200، الجذر
  `bookdata-v13`، `works/sw.js`=`works-v1.0.9`، وبطاقة «خريدة العجائب» في `/works/`.
  و`test_kharidat_live.mjs`: **67 قسمًا أونلاين وأوفلاين، SW مُسجّل، بحث أونلاين (الأندلس 35)
  وأوفلاين (النيل 44)، 0 أخطاء**.


## Addendum 38 — تطبيق «أخبار الزمان ومروج الذهب» (/masoudi-encyclopedia/) — المسعودي

- **طلب المستخدم:** دمج كتابَي المسعودي (**أخبار الزمان ومن أباده الحدثان** + **مروج الذهب
  ومعادن الجوهر**) في **تطبيق واحد** بفهرس واحد وشريط بحث واحد، مع مظهر مخطوط، فاتح/داكن،
  خطوط أميري/شهرزاد/القاهرة، بحث فوري + تظليل + عدّاد نتائج، فهرس RTL، دعم Smart TV،
  ويعمل **أونلاين وأوفلاين**؛ ثم وضعه في شجرة الروابط `works` ضمن قسم **Maktaba (غير المقفل)**
  مع بقية التطبيقات، بحذر، وأيقونة جيّدة، ثم push/deploy/backup ومشاركة الروابط.
- **المصادر:**
  - **أخبار الزمان** = المكتبة الشاملة **كتاب رقم 8620** عبر
    `https://shamela.ws/ajax/pageContent/8620/{id}` (حقوق: `nass, part, pageNum, title,
    nextId, prevId, pageId`). `crawl_akhbar.mjs` → **258 صفحة**.
  - **مروج الذهب** = نسخة **أرشيف الإنترنت** (`djvu.txt`، **4 أجزاء**) → `muruj_v1..v4.txt`
    (~2.14M حرف نظيف). ملاحظة OCR: الفاصلة العربية «،» كثيرًا ما تُقرأ «ء» في نهاية الكلمة.
- **بناء البيانات:** `build_masoudi_data.mjs` → `masoudi_data.json` = **131 قسمًا
  (37 أخبار الزمان + 94 مروج الذهب)، 7352 فقرة، ~2.35M حرف (4,302,083 بايت)**. أُصلحت علّتان:
  `cur.title → cur.t` (كان يمنع تجميع أبواب أخبار الزمان → 258 قسمًا غير مدموجة) وإزالة
  `'ما '` من `HEAD_START` (التقاط أبيات شعر خطأً)، وإسقاط الأقسام الفارغة، وإصلاح سجلّ العدّ.
- **التطبيق (ملف واحد، مخطوط):** انطلاقًا من قارئ خريدة العجائب بباتش مؤكَّد العدّ
  (`patch_build_masoudi.mjs`): أكثر من 19 استبدالًا + إعادة تسمية مفاتيح `localStorage`
  (`kharidat-* → masoudi-*`)، لوحة ألوان أخضر-فيروزي/ذهبي (فاتح `#0e6b63`، داكن `#0f1716`)،
  شارتان للعملين (`.wt.w-akhbar`/`.wt.w-muruj`)، رقائق فلتر العمل في الدرج
  (الكل/أخبار الزمان/مروج الذهب)، وشارات على عناوين الأبواب.
  - **مطلب الدمج:** فهرس **واحد** + شريط بحث **واحد** يغطّي الكتابين معًا (لا تبويب منفصل).
  - **دعم Smart TV:** `tabindex/role`، تركيز أول عنصر، أسهم ↑/↓، Enter/Space، Esc/رجوع يُغلق.
  - **أيقونة:** أسطرلاب فيروزي/ذهبي مع كتاب مفتوح (`icon.svg`) + `icon-192/512.png` عبر sharp.
  - `sw.js`: `VERSION masoudi-v1` — **offline-first**: تخزين مسبق للغلاف + `data.json`
    (4.3MB) + `manifest.json` + الأيقونات + خطوط Google (CSS + `woff2` مع تسخين الخطوط في
    `activate`)، استراتيجية cache-first، والتنقّل يُخدَم من الكاش فلا يحتاج الشبكة للإقلاع.
    `manifest.json`: `theme_color #0e6b63`، RTL، standalone.
- **الإدماج في works (بحذر، إضافي، بنسخ احتياطية):**
  - `works/index.html`: إضافة عنصر إلى `maktaba` (`🏛️ أخبار الزمان ومروج الذهب`, tag
    History, icon `/masoudi-encyclopedia/icon.svg`) → **15 → 16**.
  - `sw.js` (الجذر): إضافة `masoudi-encyclopedia` إلى `SHELLS` و`APPS`، ورفع
    `DATA_MARKER` `/__bookdata-v13 → v14`. `CDN` يحتوي عنوان خطوط Google المطلوب حرفيًّا.
  - `works/sw.js`: إضافة أيقونتَي masoudi إلى `CORE`، ورفع الكاش `works-v1.0.9 → v1.0.10`.
  - **نسخ احتياطية:** `BAK6.works.index.html`, `BAK6.root.sw.js`, `BAK6.works.sw.js`.
- **التحقق المحلي:** `test_masoudi_local.mjs` (خادم 8934): **131 قسمًا**، شارات 37/94، بحث
  «الإسكندرية» 72 و«البرامكة» 32، فتح/إغلاق الفهرس + Esc + أول عنصر مُركَّز، فلتر
  37/94/131، تنقّل بالأسهم أثناء الفلترة، مظهر داكن (`theme-color #0f1716`)،
  خط `Scheherazade New`، حجم `1.5rem`؛ **لا تجاوز أفقي عند 360→1920**؛
  **أوفلاين: 131 قسمًا + بحث «بحر» (923 نتيجة)**، **0 أخطاء**. `test_works_masoudi.mjs`
  (خادم 8937): بطاقة masoudi ظاهرة في `/works/` والرابط والأيقونات 200.
- **النشر:** كوميت **`0da551f`** → رفع `22e2d03..0da551f` → بناء Pages `built`. تحقّق حيّ:
  `/masoudi-encyclopedia/` 200 (28584 بايت)، `data.json` 200 (4,302,083 بايت)، الجذر
  `bookdata-v14`، `works/sw.js`=`works-v1.0.10`، وبطاقة «موسوعة المسعودي» في `/works/`.

### 38.أ — إعادة التسمية إلى «أخبار الزمان ومروج الذهب» (كوميت `1712ca9`)

- **السبب:** المستخدم لم يجد العمل في شجرة الروابط لأنه كان مُسمّى «موسوعة المسعودي»، وهو يبحث
  عنه باسم **«أخبار الزمان»**. فاختار الاسم الموحّد **«أخبار الزمان ومروج الذهب»**.
- **التعديلات (باتش مؤكَّد العدّ `patch_rename_masoudi.mjs`، بنسخ `BAK7.*`):**
  - `works/index.html`: `name: "موسوعة المسعودي" → "أخبار الزمان ومروج الذهب"`.
  - `masoudi/index.html`: `<title>`، `<h1>`، `description`، سطر التذييل، ونصّ النسخ
    (`sectionText`) → الاسم الجديد. `manifest.json`: `name`/`description` → الجديد
    (`short_name` بقي «المسعودي»).
  - رفع النسخ: `masoudi-v1 → v2`، `works-v1.0.10 → v1.0.11`، `DATA_MARKER v14 → v15`.
- **التحقق:** `validate_scripts.mjs` (JS المضمّن + `ld+json` عبر `JSON.parse`) كلها سليمة
  (works: 4 سكربتات؛ masoudi: 2)، و`test_masoudi_local.mjs` نجح بالكامل والعنوان/H1 بالاسم
  الجديد، وأوفلاين 131 قسمًا، 0 أخطاء.

### 38.ب — إصلاح «فهرست الكتاب» في خريدة العجائب (ضمن `1712ca9`)

- **العلّة:** الفهرس (`sections[5]`، ص50) كان **فقرة واحدة مدمجة بطول 575 حرفًا** تسرد كل
  الفصول متّصلة (كانت سابقًا **عنوانًا** بطول 575 حرفًا ثم صُحّح إلى «فهرست الكتاب»، لكنّ
  النصّ بقي فقرةً مدمجة). المستخدم أشار إليه: «لم يُصلَح بعد».
- **الإصلاح (`kh_fix_fehres2.mjs`):** تقسيم الفقرة عند حدود «فصل في…/خاتمة الكتاب/وبإتمامه»
  → **17 سطرًا مستقلًّا** (فقرة لكل فصل) + سطر المقدّمة = **18 فقرة**، وكل سطر < 160 حرفًا.
  رفع `kharidat-v2 → v3`.
- **التحقق:** `kh_verify.mjs` (8936): 67 قسمًا، أطول عنوان فهرست 80، «فهرست الكتاب» موجود،
  0 عناوين >90، لا تجاوز 360→1920، **أوفلاين 67 قسمًا، 0 أخطاء**. وحيًّا: `data.json`
  المُنشَر = 67 قسمًا و`sections[5].x` = 18 فقرة (لا فقرة >160).

### 38.ج — التحقق الحيّ النهائي (بعد `1712ca9` → بناء `built`)

- `live_verify_final.mjs`: بطاقة `/works/` = «أخبار الزمان ومروج الذهب» (والاسم القديم غير
  موجود)؛ `sw.js` الجذر=`bookdata-v15`؛ `works/sw.js`=`works-v1.0.11`؛
  `kharidat/sw.js`=`kharidat-v3`؛ `masoudi/sw.js`=`masoudi-v2`؛ `kharidat/data.json`
  = 67 قسمًا وفاصل «فهرست الكتاب» = 18 فقرة؛ `masoudi/data.json` = 131 قسمًا.
- `live_render_check.mjs`: التطبيق الحيّ يرسم **131 بابًا** و`h1` = «أخبار الزمان ومروج
  الذهب» و**عرض كامل 2399127 حرف** و**0 أخطاء JS** (أونلاين).

### ملاحظة تشغيل أوفلاين

- التطبيق (وأخواته في المكتبة) **يعمل أونلاين وأوفلاين**:
  - `sw.js` الخاص بكل تطبيق يخزّن مسبقًا الغلاف + البيانات + الخطوط، والتنقّل من الكاش.
  - `sw.js` الجذري (scope `/`) يخزّن أغلفة المكتبة كلها + البيانات عبر الأجهزة، ويتحكّم
    بالزيارة الأولى؛ و`DATA_MARKER` يدفعه لإعادة التخزين عند تغيّر أي غلاف/بيانات.
  - عند فتح الرابط بعد نشر تحديث **ظهور النسخة الجديدة** يتطلّب تفعيل الـ SW الجديد
    (تحديث/إعادة تحميل مرّتين) لأن استراتيجية التنقّل cache-first.


### 38.د — التحقق الحيّ من العمل أونلاين وأوفلاين (من زيارة /works/ فقط)

- **السؤال:** هل يلزم تحديث `ucfzem.github.io/works` لضمان عمل كل شيء أوفلاين (مع الأيقونات)؟
- **الجواب:** لا — التغطية قائمة أصلًا: زيارة `/works/` تُسجّل **SW الجذر** (scope `/`) وتُرسل له
  `prefetch-book-data`؛ و`SHELLS`/`APPS` تضمّ `masoudi-encyclopedia` (وقد أُضيفت)، و`CORE`
  في `works/sw.js` يضمّ أيقونتَي masoudi. وهذا كافٍ.
- **اختبار أوفلاين فعلي (`test_works_offline3.mjs`، متصفح نقي):**
  1. زيارة `/works/` أونلاين → تسجيل SW الجذر + رسالة التخزين المسبق.
  2. **SW الجذر يتحوّل إلى active بعد ~15 ثانية** (install يخزّن أغلفة ~27 تطبيقًا + CDN؛ قبل
     اكتماله لا يحكم مسارات التطبيقات، لذا الانتقال لها قبل ذلك يفشل بـ
     `ERR_INTERNET_DISCONNECTED` — سلوك طبيعي وليس عيبًا).
  3. بعد التفعيل: **قطع الشبكة** → `/works/` يعرض البطاقة ✅ و**20/20 أيقونة تُجلب من الكاش**،
     و`/masoudi-encyclopedia/` = **131 بابًا**، و`/kharidat-al-ajaib/` = **67 بابًا** — كلها أوفلاين.
- **الخلاصة:** كل التطبيقات (ومنها «أخبار الزمان ومروج الذهب») تعمل **أونلاين وأوفلاين** مع الأيقونات
  من مجرّد زيارة صفحة المكتبة، دون فتح كل تطبيق مسبقًا. لا حاجة لأي تعديل إضافي على `/works/`.


### 38.هـ — تحسين أداء «أخبار الزمان ومروج الذهب» للهواتف الضعيفة (كوميت `7fc7fde`)

- **الشكوى:** تعذّر تشغيل الكتاب على هاتف Android 8 صغير/بطيء — **انهار** عند الفتح.
- **السبب الجذري:** دالة `render()` كانت تبني **كل** الكتاب في سلسلة HTML واحدة ثم `innerHTML`
  دفعةً واحدة → **131 بابًا × ~56 فقرة ≈ 7352 عنصر `<p>`** و~2.4M محرف DOM دفعةً واحدة،
  مع تحليل `data.json` (4.3MB) → ذروة ذاكرة تُسبب OOM على جهاز محدود الذاكرة.
- **الإصلاح (عرض كسول + `content-visibility`):**
  - **`IntersectionObserver`** (`rootMargin:"1500px"`): تُبنى فقرات الباب **فقط عند اقترابه من
    الشاشة**؛ الأبواب البعيدة تبقى "بذرة" (`data-built="0"`) بعنوانها وأزرارها فقط.
  - **بناء فوري** لأول 3 أبواب (فوق الطيّة) لقارئ يبدأ القراءة فورًا.
  - **`content-visibility:auto; contain-intrinsic-size:auto 700px`** على `.chapter-card` → تخطّي
    التخطيط/الرسم للأبواب خارج الشاشة.
  - **التنقّل يحضر الباب أولًا:** `goSec()` (الفهرس/السابق/التالي) و`restorePos()` يبنيان الباب
    الهدف (`buildBody`) قبل `scrollIntoView` لتفادي القفزات.
  - **توحيد التظليل مع العدّاد:** `hiRegex` صار يبني أصنافًا مطابقة للهمزات/الألف/التاء المربوطة/
    الياء (`[اأإآٱ]`, `[يىئ]`, `[وؤ]`, `[هة]`) بدل المطابقة الحرفية، فيتّسق التظليل مع
    `countMatches` (كان «الإسكندرية» يُعدّ 72 نتيجة بـ0 تظليل). والتمرير الآن لأول **نتيجة فعلية**.
- **القياس (محلي وحيّ، نافذة 360×640):**
  - **عند الفتح:** 131 بابًا لكن **3 مبنية فقط، 145 فقرة، 1781 عقدة** (بدل ~7352 فقرة).
  - **القفز لآخر باب:** يُبنى عند الطلب (scrollY ≈121685).
  - **بحث «بحر»:** 923 نتيجة، والأبواب المطابقة تظهر والبناء يتمّ أثناء التمرير.
  - **جميع اختبارات `test_masoudi_local.mjs`** تنجح: 131 قسمًا، شارات 37/94، فلتر 37/94/131،
    مظهر/خط/حجم، لا تجاوز 360→1920، **أوفلاين 131 قسمًا وبحث «بحر» 923**، **0 أخطاء**.
- **النشر:** `sw masoudi-v2→v3` + `DATA_MARKER v15→v16` (لإعادة تخزين الغلاف الجديد في SW الجذر).
  كوميت **`7fc7fde`** → `built`. تحقّق حيّ: `masoudi/sw.js`=`masoudi-v3`، الجذر=`bookdata-v16`،
  **عند الفتح 1781 عقدة/145 فقرة/3 أبواب**، بحث «بحر» 923، **0 أخطاء**.
- **النتيجة المتوقعة:** انخفاض حادّ في ذروة الذاكرة وزمن الفتح → يعمل على الهواتف الضعيفة/الصغيرة
  (Android 8) دون انهيار، مع الحفاظ على تجربة القراءة المتّصلة وبحث كامل في الكتاب.
