# Conversation Backup — a3lam-al-3olama — 2026-11-17

## Session 1 — initial self-contained directory (commit `b6e959b`)

Created `a3lam-al-3olama/index.html` as a single, self-contained HTML file per the
brief (22,638 B):

- RTL Arabic (`dir="rtl"`, `lang="ar"`), light/dark themes via CSS variables +
  toggle, persisted in `localStorage` (`a3lam-theme`).
- Google Fonts: IBM Plex Sans Arabic (400–700) + Noto Naskh Arabic.
- Masonry via `column-count` (1 / 2 / 3) with `break-inside: avoid`; header with
  title, description, dynamic count badge, theme toggle; search bar with SVG icon.
- Card: initials avatar, title, meta, role, tag pills, two bios, platforms block,
  series block (diamond bullets), works list (`<strong>` titles), quote block.
- Live search on each card's `data-search` (name, tags, role, platforms, series),
  dynamic `N من M` count, "no results" state.
- Smart links: `getPlatformURL()` (YouTube/Facebook/Instagram/X/TikTok/SoundCloud
  search URLs, Telegram via `site:t.me`, Website/Podcasts via Google) and
  `getSeriesURL()` (YouTube `"series" scholar`). All links
  `target="_blank" rel="noopener noreferrer"`.
- Security: `escapeHTML()` everywhere; `sanitizeWorks()` re-enables only
  `<strong>` after escaping, so `<img>`/`<script>` payloads are neutralised.
- Data: only the supplied `othman-al-khamees` sample; 26 of 27 still pending.
- Tests: 26/26 with a DOM shim. Live hash `523813bc…` matched local; Pages built.

## Session 2 — multilingual AR/EN/FR/ES + translations schema (commit `171ccfd`)

- Language selector in the header next to the theme toggle:
  🇲🇦 AR · 🇬🇧 EN · 🇫🇷 FR · 🇪🇸 ES, active pill highlighted, persisted in
  `localStorage` (`a3lam-lang`).
- Dynamic direction: AR → `<html dir="rtl" lang="ar">`; EN/FR/ES →
  `<html dir="ltr" lang="…">`. CSS converted to logical properties
  (`padding-inline`, `border-inline-start`, `inset-inline-start`,
  `margin-inline`); search padding and quote border/radius fixed for mirroring.
- Fonts switch: IBM Plex Sans Arabic for AR; Inter/system-ui for EN/FR/ES
  (including `h1`, quote, avatar overrides).
- `uiStrings` dictionary with the specified keys plus `noResultsHint`,
  `appTitle`, `eyebrow`, `lede`, `footer`, `themeToggle`, `cardsLabel`,
  `searchLabel`. Updates search placeholder, section labels, count
  (`N of M Profiles` etc.), empty state, footer, `document.title`, aria labels.
- Data schema upgraded to:
  `name {ar,en,fr,es}`, localized `meta`, `tags {ar,en,fr,es}`, and
  `translations.{ar,en,fr,es} = { title, role, upbringing,
  daWahAndPositions, works, quote }`; `digitalPresence` unchanged.
  Helpers: `T()`, `scholarName()`, `localizedTags()`; the search index spans all
  four languages.
- Generated EN/FR/ES translations for the supplied Arabic sample (truncated
  Arabic text kept as "…" to avoid inventing content).
- Tests: **82/82** — language switching, `lang`/`dir`, per-language rendering,
  cross-language search, AR fallback, XSS sanitisation, theme, logical CSS.
- File 35,416 B, SHA-256 `8ae05de5…`; deployed and verified live == local.

## Session 3 — Maktaba link tree integration (commit `e1c96ed`)

- Added `a3lam-al-3olama/icon.svg` (gold open book on deep green, four dots for
  the four languages; 884 B, valid XML).
- Added the final multilingual version to the Maktaba link tree
  (`works/Maktaba/index.html`) in the **Webapps** section, directly under the
  A3lam al-Dawa entry:
  - title «أعلام العلماء · Scholars Directory», tag
    «Directory · AR / EN / FR / ES», link
    `https://ucfzem.github.io/a3lam-al-3olama/`, icon from the new `icon.svg`.
  - counts updated: 4 → 5 apps, subtitle 4 → 5 webapps, meta description.
- `works/Maktaba/sw.js`: `CACHE` `maktaba-main-v5` → `v6`; the new icon added
  to `EXTERNAL`.
- A3lam al-Dawa entry left intact and unchanged.
- Tests: app **82/82**; Maktaba **16/16** (new link once, Dawa link intact,
  5 webapp cards, no duplicate IDs, SW v6, icon SVG valid). Live Maktaba ==
  local; live app hash `8ae05de5…` unchanged.

## Session 4 — final 27-scholar rewrite + deployment (commit `ae22b0a`)

- Replaced the whole app with the user's supplied final single-file HTML:
  - **27 scholars** complete, schema `tr.{ar,en}` with `getT()`/`getArr()`
    fallback to English when a field is missing.
  - UI strings fully translated for **AR / EN / FR / ES**; direction and `<html
    lang>` update per language. Long-form FR/ES content (titles, roles, bios,
    works, series) intentionally falls back to English; tags are localised.
  - Header with 27-count badge, language pills (AR/EN/FR/ES), theme toggle,
    live search, no-results state, quote blocks, smart platform/series links.
  - Minimal patches to the supplied code: every generated `<a>` now carries
    `target="_blank" rel="noopener noreferrer"`, and
    `document.documentElement.dir` is set alongside `document.body.dir`.
- **Tests: 63/63** (Node `vm` + DOM shim): 27 parsed objects, 27 cards,
  AR/EN/FR/ES switching, `lang`/`dir`, FR/ES fallback-to-EN, search filtering
  (`1 / 27`, `0 / 27`, reset `27`), empty state, theme persistence, link
  `target`/`rel`, smart URL helpers. `node --check` passes.
- File: 50,141 B; SHA-256
  `dfe40aa14cd182d224d762d75484e8f87c09193429b8d7445c7545081644dd38`.
- Note: the app brands itself «أعلام الدعوة / A'lam al-Dawa» while living in
  `a3lam-al-3olama/`; the Maktaba card still reads «أعلام العلماء». Optional
  follow-up: align the card title / directory name.

## Session 5 — copy-all-names button (commit `a0dced1`)

- Added a toolbar button «نسخ الأسماء / Copy names» that copies the 27
  scholar titles, numbered `1.` → `27.`, one per line, in the current
  language.
- Uses `navigator.clipboard.writeText` with a hidden-`<textarea>` +
  `document.execCommand('copy')` fallback; shows «تم النسخ / Copied /
  Copié / Copiado» for 2 seconds, then resets.
- Localised labels added to all four UI dictionaries; label resets on
  language switch. Clipboard icon is inline SVG (no new dependencies).
- Tests: **80/80** (previous 63 + 17 copy checks: EN/AR content, 27 lines,
  first/last, feedback, FR fallback, clipboard-denied fallback).
- File: 52,650 B; SHA-256
  `da083e5b8e9b3375b1c379d7bc5045d7971c1f39f210e4e9fbdf7f6cd42d28ef`.

## Session 6 — replace Shams al-Din with Mustapha Ben Hamza (commit `a39162e`)

- Removed scholar **#21 محمد بن شمس الدين** (`id:"shams"`) and replaced him
  with **العلامة الدكتور مصطفى بن حمزة** (`id:"benhamza"`).
- New entry: born 17 July 1949 in Oujda (21 Ramadan 1368 AH); Sharia degree
  from Fez (Al-Qarawiyyin) + Arabic Literature from Rabat (Mohammed V);
  higher studies at Dar al-Hadith al-Hassania; State Doctorate from Mohammed
  First University, Oujda. President of the Regional Scientific Council of
  the Oriental Region; member of the Supreme Scientific Council, Mohammed VI
  Foundation for African Ulema, and Muslim Council of Elders; director of the
  Institute of Islamic Revival in Oujda; Alawite Order of Commander (2007).
- Works added: «حقوق المعوقين في الإسلام» (1993), «نظرية العامل في النحو
  العربي» (2004), «شخصية الفقه المالكي», «الأسس الثقافية لمنع تطبيق الشريعة».
- Tags: الفقه المالكي / الدراسات الإسلامية; platforms: YouTube, Website;
  series: الدروس الحسنية الرمضانية, برامج الفتوى. AR + EN full text; FR/ES
  fall back to EN as before.
- No verified personal quote was available, so the quote field is omitted for
  this entry and `cardHTML()` now renders the quote block conditionally.
- Tests: **95/95** (previous 80 + 15 replacement checks: AR/EN card #21,
  tags/meta, Shams removed, no `undefined`, no empty quote block, copy list
  line #21 in AR/EN). `node --check` passes.
- File: 56,930 B; SHA-256
  `35e8eb3578bc08741421268322b12b8ee32d91580949c19b99490496ac1e0880`.
- Next: user will supply small portraits for every scholar; wire them into
  the card avatars with the current initials as fallback.

## Session 7 — new list: #13, #14 and #21 title (commit `e23754b`)

- **#13** replaced: الدكتور عمرو خالد → **الأستاذ الداعية ياسين العمري**
  (`id:"amri"`). Bio from his official site (`el-amri.com/biography`):
  Moroccan preacher, student of knowledge and educational lecturer; diploma in
  teaching expression/communication, licentiate in French language and
  literature, studies in Sharia and education. Series: السيرة النبوية, شرح
  الأربعون النووية, مجالس القرآن. Quote: «العلم النافع نورٌ يهدي الله به
  القلوب والعقول إلى طريق الاستقامة.» Birth year deliberately left out
  (sources conflict); meta is country only.
- **#14** replaced: فضيلة الأستاذ الدكتور علي جمعة → **فضيلة الشيخ الدكتور
  رشيد نافع** (`id:"nafi"`). Born Rabat, 16 Ramadan 1382 / 23 Feb 1961;
  studied under al-Hilali and Hammad al-Ansari; licentiate from the Islamic
  University of Madinah (Aqeedah); higher studies at Mohammed V; State
  Doctorate in Hadith from Hassan II. Member of the League of Moroccan
  Scholars; preacher of the Unity Mosque, Rabat; relief work in Bosnia,
  Zaatari, Cox's Bazar and Morocco; founding member of the 2005 Bahrain
  conference. Works: يوسف بن تاشفين ودعوته, أيها التائب أقبل, المرسل الخفي
  وحجيته. No verified personal quote, so the quote block is hidden.
- **#21** title shortened to **العلامة مصطفى بن حمزة** (EN: Allama Mustapha
  Ben Hamza), matching the new list.
- Tests: **117/117** (previous 95 + 22 checks: new #13/#14 AR/EN content,
  tags/works/series, old names absent, copy list lines #13/#14, #21 title).
- File: 61,826 B; SHA-256
  `b70c381f84c6ed03f66848e354658a0e42382089014f8bf3b78f72d71ee230f1`.

## Pending

1. Scholar portraits: user will provide small pictures; add `pictures/` and
   map each `id` to an image, falling back to initials.
2. No service worker / manifest in this single-file project (by design).
3. Revoke the recovery PAT after the work is finished.
4. Optional: align the Maktaba card title or move the app to `a3lam-al-dawa/`.

## Links

- Live: https://ucfzem.github.io/a3lam-al-3olama/
- Repo folder: https://github.com/ucfzem/ucfzem.github.io/tree/main/a3lam-al-3olama
- index.html: https://github.com/ucfzem/ucfzem.github.io/blob/main/a3lam-al-3olama/index.html
- Initial commit: https://github.com/ucfzem/ucfzem.github.io/commit/b6e959b60cad090c43beb2360b7975793710dd2f
- Multilingual commit: https://github.com/ucfzem/ucfzem.github.io/commit/171ccfd5e661e689bac6bc79d61aede7b3dc9153
- Maktaba commit: https://github.com/ucfzem/ucfzem.github.io/commit/e1c96ed0c8e01817485cd957884d60daf4340a2f
- Final 27-scholar commit: https://github.com/ucfzem/ucfzem.github.io/commit/ae22b0a55ba59444f9a5abdb1eea928320666465
- Copy-names commit: https://github.com/ucfzem/ucfzem.github.io/commit/a0dced13abff0bd91065821ea26b983a798b80d6
- Ben Hamza commit: https://github.com/ucfzem/ucfzem.github.io/commit/a39162eb06a055b21d1d90f61c71f3307c72de34
- New-list commit: https://github.com/ucfzem/ucfzem.github.io/commit/e23754b08a306cbde3cf78f2322a0bf0b84b1f21
- Folder history: https://github.com/ucfzem/ucfzem.github.io/commits/main/a3lam-al-3olama
- Maktaba live: https://ucfzem.github.io/works/Maktaba/
- Maktaba source: https://github.com/ucfzem/ucfzem.github.io/blob/main/works/Maktaba/index.html
- Icon: https://ucfzem.github.io/a3lam-al-3olama/icon.svg
