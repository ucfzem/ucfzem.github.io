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

## Session 8 — replace Mustafa Hosny with Abu Ishaq al-Huwaini (commit `0488f92`)

- **#19** replaced: الأستاذ مصطفى حسني → **فضيلة الشيخ أبو إسحاق الحويني**
  (`id:"huwaini"`).
- Biography (Arabic Wikipedia / BBC Arabic / Al-Azhar): born 10 June 1956 in
  Huwain, Kafr El-Sheikh; graduated from Ain Shams University (Al-Alsun,
  Spanish Department) with honors; studied under Muhammad Najib al-Muti'i,
  al-Albani (closest influence), Ibn Baz, Ibn Uthaymeen, Ibn Jibrin and
  Abdullah ibn Qu'ud; preached at the Sheikh al-Islam Mosque and Ibn Taymiyyah
  Mosque; presented «فضفضة» on Al-Nas TV and worked with Al-Hekma, Al-Rahma
  and Al-Nada. Died in Doha on 17 Ramadan 1446 / 17 March 2025; buried in
  Mesaimeer Cemetery.
- Works: «فصل الخطاب بنقد المغني عن الحفظ والكتاب» (1985),
  «الانشراح في آداب النكاح» (1987),
  «النافلة في الأحاديث الضعيفة والباطلة» (1988).
- Quote (his own): «دراستي لكتاب السلسلة الضعيفة مدة سنتين أيام الجامعة كانت
  أعظم فائدة من كل سني التحصيل العلمي الأخرى.»
- Meta shows `1956–2025`; tags الحديث / الفقه الشافعي; platforms YouTube,
  Facebook; series فضفضة, أصداف اللؤلؤ.
- Tests: **134/134** (previous 117 + 17 checks: #19 AR/EN card, dates, works,
  quote, death, Mustafa Hosny absent, copy list line #19 in AR/EN).
- File: 64,765 B; SHA-256
  `ab2ef1a6bf5dfa21d024077b7d6e18792b76d4500bb88955de0f8ce37147ca1c`.

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
- Huwaini commit: https://github.com/ucfzem/ucfzem.github.io/commit/0488f928b803a631e51b591d855b738f074a4aff
- Folder history: https://github.com/ucfzem/ucfzem.github.io/commits/main/a3lam-al-3olama
- Maktaba live: https://ucfzem.github.io/works/Maktaba/
- Maktaba source: https://github.com/ucfzem/ucfzem.github.io/blob/main/works/Maktaba/index.html
- Icon: https://ucfzem.github.io/a3lam-al-3olama/icon.svg


## Session 9 (continued 2026-11-18) — 24 identity-mapped scholar portraits

- User provided portrait zip: `https://tmpfiles.org/wJA2t5hLoCDG/machaikhsother1.zip` (direct: `https://tmpfiles.org/dl/1795009097.bf4c89da1c33255f/wJA2t5hLoCDG/machaikhsother1.zip`, 27 images in `Machaikhs other1/`, `01.jpeg` + `02-27.jpg`).
- Yandex reverse-image identified the set as not 1:1 with the current 27-scholar list: clear matches 01 Othman, 02 Said Al-Kamali, 03 Ayman Abdel Rahim, 04 Eyad Qunaibi, 06 Omar Suleiman, 07 Yasir Qadhi, 08 Nouman Ali Khan, 09 Zakir Naik, 10 Hamza Yusuf, 11 Tariq Jameel, 12 Ahmed Shugairi, 13 Yassine El Amri, 17 Yahya Raaby, 18 Omar Abdelkafy, 19 Abu Ishaq al-Huwaini, 20 Muhammad Abu al-Huda al-Yaqoubi, 21 Mustapha Ben Hamza, 22 Bilal Philips, 23 Siraj Wahhaj, 24 Suhaib Webb, 25 Tariq Masood, 26 Mohammed Al-Ourayfi, 27 Nabil Al-Awadhi. Mismatches/other: 05 Mishary Rashid Alafasy (not in list), 14 Muhammad Tahir ul-Qadri (not Rachid Nafi), 15 unidentified, 16 Mufti Ismail Menk (matches #5 Ismail Menk, not #16 Adnaan Menk).
- Implemented **identity-mapped** portraits (recommended): `pictures/` added with 24 cropped 300×300 JPGs (`abdelkafy,ahmed,amri,ayman,benhamza,eyad,hamza,huwaini,masood,menk,nabil,nouman,omar,othman,ourayfi,philips,said,siraj,suhaib,tariq,yahya,yaqoubi,yasir,zakir`). `#14 Rachid Nafi`, `#15 Belal Assaad`, `#16 Adnaan Menk` intentionally keep initials fallback (no matching image in provided zip). Skipped unused zip images `05,14,15`.
- `index.html`: avatar CSS updated (`position:relative; overflow:hidden` + `img` absolute/object-fit cover); `PHOTO_IDS` set + `<img src="pictures/${id}.jpg" ...>` rendered over initials fallback.
- Tests: local and live `FILE=... node /tmp/opencode/test-final.js` → **134/134 passed**.
- App commit: `72b8c1c0914d1a2c842963f0347fcb05715a1e0a` (25 files). Live `index.html` SHA-256 `03c490e01c0c48201ef6b882f66a1423e13446cbe9613a23e537a92a136e1137`; `pictures/menk.jpg`/`pictures/othman.jpg` HTTP 200, `pictures/nafi.jpg`/`pictures/belal.jpg`/`pictures/adnaan.jpg` HTTP 404 (fallback expected).

### Current state (end of session 9)

- **Live app:** https://ucfzem.github.io/a3lam-al-3olama/ — 27 scholars, 24 portraits, initials fallback for Rachid Nafi/Belal Assaad/Adnaan Menk, copy-names button, 134/134 tests.
- **Pending:** optional correct portraits for Rachid Nafi, Belal Assaad, Adnaan Menk; optional Maktaba card title alignment («أعلام العلماء» vs «أعلام الدعوة»).


## Session 9 (continued 2026-11-18) — Belal Assaad portrait added

- New zip received: `https://tmpfiles.org/w3AFth4QOz80/rest.zip` (direct `https://tmpfiles.org/dl/1795013900.1cc706677db8b5cf/w3AFth4QOz80/rest.zip`). Yandex check: `15.jpg` matched Belal Assaad (added); `14.jpg` matched Muhammad Tahir ul-Qadri (not Rachid Nafi, skipped); `16.jpg` matched Mishary Rashid Alafasy (not Adnaan Menk, skipped).
- Added `pictures/belal.jpg` (300×300) and included `belal` in `PHOTO_IDS`. `#14 Rachid Nafi` and `#16 Adnaan Menk` remain with initials fallback pending correct photos.
- App commit: `6f6e6ee009050772fcc713d1565a59f164647cb7`. Live `index.html` SHA-256 `1507da73ad77e687a8b289a2512cbbf22331a488d694c2b5c305dad62efbb5b3`; `pictures/belal.jpg` HTTP 200. Tests 134/134.

### Current state (end of session 9, final)

- **Live app:** https://ucfzem.github.io/a3lam-al-3olama/ — 27 scholars, **25 portraits**, initials fallback for **Rachid Nafi** and **Adnaan Menk** only.
- **Pending:** correct portraits for Rachid Nafi (#14) and Adnaan Menk (#16).
