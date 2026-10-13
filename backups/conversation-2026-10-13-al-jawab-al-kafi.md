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
