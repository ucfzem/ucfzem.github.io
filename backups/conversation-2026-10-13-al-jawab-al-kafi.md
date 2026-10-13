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
