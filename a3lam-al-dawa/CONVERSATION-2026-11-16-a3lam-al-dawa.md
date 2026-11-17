# Conversation Backup — a3lam-al-dawa — 2026-11-16

## Session goal
Fix the deployed `a3lam-al-dawa` PWA (38 scholar cards) that rendered a blank page
with `SyntaxError: Invalid or unexpected token` at line 152.

## Root cause (verified)
The error was **not** invisible Arabic characters. It was **HTML-entity decoding**
damage introduced when the file was round-tripped through an HTML parser during an
earlier retype:

- `esc()` object literal had its entity values decoded:

  Before (broken):
  ```js
  return { '&':'&', '<':'<', '>':'>', '"':'"', "'":''' }[c];
  ```
  After (fixed):
  ```js
  return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  ```

  `'&#39;'` had decoded to `'`, producing an unterminated string (`'''`) → SyntaxError.

- Error overlay no-op also fixed: `String(msg).replace(/</g, '<')` → `replace(/</g, '&lt;')`.

- Verification: `grep -c '&amp;\|&lt;\|&gt;\|&quot;\|&#39;' index.html` returned **0**
  before the fix (all entities decoded). After fix both `<script>` blocks pass
  `node`/`new Function` parse.

## Diagnostic evidence
- `find $HOME /sdcard /tmp -iname index.html` → the original clean file
  (SHA-256 `d22884dd…`) was **not** found anywhere on disk.
- `node --check` on the extracted second `<script>` block failed at
  `"'":'''` with `SyntaxError: Invalid or unexpected token` — exactly line 152.
- Unicode codepoint dump for U+2000–U+206F / U+FEFF / U+2028 / U+2029: **none found**
  (invisible-char theory retired).
- Traced history: last commit whose script parsed was `0ec077d`; corruption of the
  `esc()` form is present in all later commits.

## Fix commit
- `2ee809b` — "Fix esc() entity decoding (SyntaxError line 152) + bump SW cache v17"
  - `a3lam-al-dawa/index.html`: restored entities (index SHA-256 `0923d23f…2222de3`)
  - `a3lam-al-dawa/sw.js`: `CACHE_NAME` `a3lam-al-dawa-v16` → `a3lam-al-dawa-v17`
    (SW already had `skipWaiting()` + `clients.claim()`)

## Live verification
- `https://ucfzem.github.io/a3lam-al-dawa/index.html` now serves SHA-256
  `0923d23f17c0011d771045becd96474e97079ec808133751c2a4f1d2e2222de3`.
- Both inline scripts parse; the line-152 SyntaxError is resolved.

## Known remaining issue (content)
The Arabic **content** is still corrupted from the same earlier retype — separate
from the syntax bug:

- 33 of 38 scholar `desc` fields were translated to English/French (e.g. #10–#38),
  some mangled (`#09 "باحث€ ود€ call'i"`, `#04 "…directe et la théorie darwinienne"`).
- Names #16 (`عبدullah الشهري`) and #29–#36 are transliterated, not Arabic.
- Arabic UI strings contaminated: `ar.none:'Aucun resultat.'`, `ar.count:'{n} Ergebnis'`,
  `ar.ph:'ابحث par le nom ou le spécialité...'`.

The pristine original (SHA-256 `d22884dd…`) is not recoverable from disk or from any
commit. Correct Arabic text must be re-supplied or reconstructed from the earliest
commit `4d74604` (which holds correct Arabic for a partially different scholar set).

## Session 2 — frontend / i18n / avatar refactor (commit `f10b09e`)
QA asked for: image fallbacks, missing Arabic display names, and multi-language
secondary fields.

### Avatar / image fallback
- `images/` is empty, so every `images/NN.jpg` 404s. Replaced the canvas-based
  fallback (which returned `''` on webviews without a 2D context → empty grey
  circles) with a deterministic **SVG data-URI initials** avatar.
- Wired via inline `onerror="window.__fb(this)"` plus a capture-phase `error`
  backstop. No canvas, no dependency, offline-safe, no layout shift (fixed 65×65).

### Content / localization
- Located the original multilingual dataset in `data.js` (`PROFILES` with
  `name/spec/bio` in ar/fr/en/es). Merged it programmatically (not by retyping)
  into **24 of 38** entries: correct Arabic name + en/fr/es name, spec (tag) and
  bio (desc).
- Remaining **14** entries (#07,12,13,15,16,22,23,28,31–36) have no clean source
  in the repo; kept as-is (#16 name corrected to عبدالله الشهري). Their
  descriptions are still English/French and need re-supply.
- Render is now language-aware via `L(field)` (object → current lang → ar → en),
  so name/desc/tag swap across AR/FR/EN/ES; search index spans all four languages.
- Fixed corrupted Arabic UI strings: `ph`, `none`, `count` (was `{n} Ergebnis`),
  and `sub` (was `({n}Persona)`).

### Tests run
- `new Function` parse on both inline scripts: PASS.
- Resolution check: 456/456 name+desc+tag across 4 langs non-empty, no
  `[object Object]`.
- DOM-shim smoke test: 38 cards (AR), `images/01.jpg` attempted, #16 Arabic,
  count "38 نتيجة"; FR/EN dir=ltr and localized names; `__fb` returns SVG URI.
- Live hash after deploy: `34a9abe7…` (Pages), scripts PASS.

## Session 3 — TikTok native deep links (commit `4254f16`)
Problem: TikTok links opened in the in-app webview / browser and hit a login wall.

Implementation (vanilla, no deps):
- `openTikTok(webUrl, handle)`: on Android uses
  `intent://tiktok.com/<path>#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`;
  on iOS uses `snssdk1233://www.tiktok.com/<path>`; desktop opens the web URL.
- `launchApp(scheme, webUrl)`: sets `location.href` to the scheme, then falls
  back to the web URL after 700 ms **only if** the page never lost visibility
  (visibilitychange/pagehide), so an installed app cancels the fallback.
- `ttHandle(url)`: extracts `@handle` from real TikTok URLs; search URLs use the
  path instead.
- Delegated click handler on `[data-tiktok]` (event delegation, no inline JS).
- CSS: `.btn:active{opacity:.7}`, tap-highlight removed, no layout shift.
- SW cache bumped `v17 → v18`.

Tests: both scripts parse; 38 cards; `data-tiktok`/`data-tt-handle` emitted;
`ttHandle` correct; generated Android `intent://…com.zhiliaoapp.musically…` and
iOS `snssdk1233://…` schemes verified. Live hash `dd484206…`; SW `v18`.

## Session 4 — Arabic text for the last 14 entries (commit `119eb46`)
The 14 entries without a clean source (#07,12,13,15,16,22,23,28,31–36) still
showed English/French roles and bios (`Academic supervisor at Zad Academy…`,
`Counter-Nasirisation`, `Comparative Religions`, `al-Sheikh Dr. Amr al-Nour…`).

Fix:
- Filled Arabic `desc` + `tag` for all 14 using the supplied Arabic strings
  (e.g. `مشرف أكاديمي في أكاديمية زاد ومنتج محتوى شرعي أصيل.`,
  `الفرق والملل`, `أصول الفقه`, `مقارعة النصيرية`, `شبهات نصرانية`,
  `التاريخ والمقارنة`, `مصادر المعرفة`). English kept as `en/fr/es` fallback.
- Restored Arabic display names for #31–36 (best-effort transliteration:
  `الشيخ د. عمرو النور الدين`, `د. حاتم العوني`, `شمس الدين الجزائري`,
  `أبو عمر البديع`, …). **These six names should be verified against a source.**
- Result: **0/38** Latin-only descriptions; **0** zero-width/format chars;
  **456/456** field resolutions across ar/fr/en/es.
- SW cache bumped `v18 → v19`.

Tests: both scripts parse; DOM render shows 38 cards with the new Arabic;
live hash `302e8dcf…`; SW `v19`.

## Session 5 — PWA manifest link + theme reconciliation (commit `94823ac`)
Found the page had **no `<link rel="manifest">`** and no apple-touch-icon, so
install/standalone chrome was unreliable.

Fix:
- Added `<link rel="manifest" href="./manifest.json">` and
  `<link rel="apple-touch-icon" href="./icon-180.png">` to `<head>`.
- `manifest.json` + `manifest.webmanifest`: `theme_color` `#1b5e3a → #121212`
  (matches the page meta theme-color and default dark theme);
  `background_color` `#f8f4e8 → #121212` (no cream splash flash);
  description "35 شخصية" → "38 شخصية".
- SW cache bumped `v19 → v20`.

Tests: scripts parse; manifest is valid JSON; live head has both links; live
manifest theme/bg `#121212` and "38"; `manifest.json` + `icon-180.png` return 200;
live hash `e2fe62c0…`; SW `v20`.

## Session 6 — full 4-language localization (commit `cf85523`)
Completed the dataset audit requested for all 38 scholars.

Fix:
- Every `name`, `tag`, `desc` is now an `{ar,en,fr,es}` object:
  **0 plain strings, 0 Arabic leaking into en/fr/es, 0 empty resolutions**.
- `#34` corrected `د. عمرو بيوني → د. عمرو بسيوني`; `#32 → الشيخ د. عمرو نور الدين`.
- Added Latin transliterations for the Arabic-only names (#07,12,13,15,16,22,23,28)
  and real FR/ES translations for the 14 patched entries (no more English-as-FR/ES).
- Converted the two stray plain entries: `#06 د. خالد الحايك`, `#38 محمود شعبان`.
- Fixed unaccented FR/ES UI labels and EN `Dahawah → Da'wah`.
- SW cache bumped `v20 → v21`.

Tests: parse PASS; DOM render 38 cards in ar/en/fr/es; AR shows 38/38 Arabic
descs; en/fr/es show 0 Arabic leaks; live hash `f6940c1c…`; SW `v21`.

### Avatar image audit (no fix applied — no assets exist)
- `a3lam-al-dawa/images/` contains **0 files**.
- `git log --all -- '*images*'` shows **no a3lam images ever committed** (hits
  belong to another project, `al-a3chab-attebiah`), so there is nothing to
  recover from history.
- Path logic is already correct: `IMG_DIR='images/'` + `s.n + '.jpg'` →
  `images/01.jpg` (relative, works under the Pages subpath); `onerror`
  gracefully swaps to the SVG-initials avatar. 100% fallback == 100% missing files.
- Action needed: upload portraits as `images/01.jpg` … `images/38.jpg`.

## Session 7 — ordered Arabic names page with copy buttons (commit `7f15494`)
Request: an Arabic list of the 38 scholars, ranked #01 → #38, with copy buttons.

Added `names.html` (standalone, RTL, dark theme matching the app, no deps):
- 38 rows, each `#NN` + Arabic name + «نسخ» button (copies that name only).
- Toolbar: «نسخ الكل» (names one per line) and «نسخ مع الأرقام» (`NN. name`).
- Clipboard API with `execCommand` textarea fallback; toast confirmation.
- Order verified 0 mismatches against `index.html`; 0 zero-width chars.
- `names.html` added to SW precache; cache `v21 → v22`.

Tests: inline script `node --check` PASS; 38 items; first `01 الدكتور هيثم طلعت`,
last `38 محمود شعبان`; live HTTP 200; SW `v22`.

## Session 8 — instant monogram + configurable image extension (commit `b444a3c`)
Request: no slow/empty avatar while portraits are absent; keep the door open.

- Golden `.mono` monogram is always in the card; `<img>` overlays it and is
  hidden on error by `window.__fb` + a capture-phase `error` listener.
- `IMG_EXT='jpg'`; `photo(s)` resolves `s.img` first, then `images/NN.jpg`.
- Folder empty and never in git history, so rendering was monogram-only.
- SW cache `v22 → v23`.

Tests: parse PASS; live index `d97a8ce7…`; SW `v23`.

## Session 9 — Option A now, photos later (merge `f438b16`)
Request: settle on monograms (no 404s) but keep per-person photos ready.

- `ENABLE_PHOTOS=false` by default → no `<img>` emitted, 0 image requests.
- Per-entry `"img":"https://…"` renders that one photo regardless of the flag;
  global flag `true` switches all 38 to `images/NN.jpg`.
- `<img>` keeps `onerror` → monogram, so a missing/corrupt file never breaks UI.
- `.avatar` gains `aspect-ratio:1/1` (mobile safety).
- SW `v23 → v24`; removed the blanket `IMGS` 38-image precache (runtime caching
  still handles successful image responses). Precache = `./`, `index.html`,
  `manifest.json`, `names.html`.
- Built on `feat/avatar-photos-flag` (`e8b493b`), rebased onto `origin/main`
  `4dfeb4c`, merged as `f438b16`. Earlier Option 3 branch
  `chore/remove-avatar-img` (`415c2a2`) is superseded and was not merged.

Tests (VM/DOM harness): default → 0 `<img>` / 38 mono / 38 avatars; flag true →
38 `<img>` / 38 `onerror`; single `s.img` → 1 `<img>` with correct src. All PASS.
Live: index `b2f41a58…`, SW `v24`, `/`, `names.html`, `manifest.json`, `sw.js`
all HTTP 200.

## Session 10 — portraits activated, first 20 uploaded (merge `0c1926b`)
Request: enable photos, SW v25, push main, deploy.

- User supplied `machaikhs20.zip` via tmpfiles.org (the direct download needed the
  `/dl/<token>/...` href, not the preview URL). 20 valid JPEGs, `01.jpg`…`20.jpg`,
  ~1.1 MB total.
- Installed in `a3lam-al-dawa/images/`; `ENABLE_PHOTOS = true`.
- SW `v24 → v25`; `PORTRAITS` precaches exactly the 20 existing files via
  `Promise.allSettled` (install never fails); runtime caching covers later arrivals.
- Missing #21…#38 return 404/503 and fall back to the monogram via `onerror`.
- Built on `feat/enable-20-portraits` (`867e0b9`), rebased onto `origin/main`
  (`b7a33b1` download script + `35fffcf` root redirect), merged as `0c1926b`.

Tests: parse PASS; DOM harness 38 cards / 38 `<img>` / 38 `onerror`; src paths
`images/01.jpg`, `images/20.jpg`, `images/21.jpg` all wired.
Live: index `d3061e1a…`, SW `v25`, `images/01.jpg` and `images/20.jpg` HTTP 200,
#21/#38 fail and fall back; `/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 11 — final 34-name roster + 34 portraits (merge `aeca57a`)
Request: remove 4 names, renumber 01→34, add the remaining 14 photos, deploy.

- Removed (old numbering) #22 `أبو منتصر شاهين`, #23 `إبراهيم خليل فيلوبوس`,
  #31 `الشيخ محمد بن سن الدين`, #37 `علي دعوة`; the rest renumbered.
- `scholars` and `names.html` regenerated from the supplied 34-name list,
  0 name mismatches; `names.html` subtitle → 01→34.
- `manifest.json` / `manifest.webmanifest` description → `34 شخصية`.
- `machaikhs14.zip` supplied `21.jpg`…`34.jpg` (14 valid JPEGs); all 34 portraits
  now present. `PORTRAITS` = 01…34; SW `v25 → v26`.
- Built on `refactor/34-scholars-34-photos` (`aeca57a`), merged to `main`.

Tests: parse PASS; DOM harness 34 cards / 34 `<img>` / 34 `onerror`; names order
matches the supplied list; 34 JPEGs valid; all live images 01…34 HTTP 200.
Live: index `bf9a5861…`, SW `v26`, `ENABLE_PHOTOS=true`, `من 01 إلى 34`,
`34 شخصية`, `/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 12 — TikTok fallback to home, no generic search (merge `acb1c96`)
Report: the TikTok button opened `/search?q=<name>` for every scholar.

- Confirmed 0 `tt`/`tiktok` fields in the 34 entries; all buttons came from
  `TT_BASE + cleanName(name)`.
- `TT_BASE` → `https://www.tiktok.com/`; `tt = s.tt || TT_BASE` (no query string).
- Per-entry `tt` overrides and native deep links (Android intent / iOS
  `snssdk1233`) kept; empty handle now means TikTok home.
- SW `v26 → v27`.

Tests: parse PASS; DOM harness 34 buttons, all `href=https://www.tiktok.com/`,
0 `search?q=`; Android fallback scheme opens TikTok home.
Live: index `110d5fa4…`, SW `v27`, 0 `search?q=` in served HTML; `/`, `names.html`,
`manifest.json`, `sw.js`, `images/01.jpg`, `images/34.jpg` all 200.

## Session 13 — TikTok buttons removed entirely (merge `3f21b41`)
Request: remove the TikTok buttons.

- Removed the TikTok `<a>` from the card template; each card now has only the
  YouTube button.
- Removed `TT_BASE`, `ttHandle()`, `launchApp()`, `openTikTok()`, the delegated
  `data-tiktok` click handler, the `.btn.tiktok` CSS rule and the `tt` label from
  all four I18N objects. 63 lines deleted, 6 inserted.
- SW `v27 → v28`.

Tests: parse PASS; DOM harness 34 cards / 34 YouTube / **0 TikTok** / 34 `<img>`
in ar, en, fr and es; 0 `tiktok` references left in `index.html`.
Live: index `1ffa4cd1…`, SW `v28`, 0 `tiktok` / 0 `data-tiktok` in served HTML;
`/`, `names.html`, `manifest.json`, `sw.js`, `images/01.jpg`, `images/34.jpg` 200.

## Session 14 — website field + conditional button (merge `877a46c`)
Request: replace the TikTok field with `website`, render a website button only
when the URL is non-empty.

- Added `website` to all 34 entries (9 supplied URLs, 25 empty), matched by
  index; names, tags, descriptions, numbers and images left untouched.
- `webTag` emitted only for non-empty `http(s)` URLs; `site` label added to the
  four I18N objects (موقع / Website / Site / Sitio web).
- YouTube button stays on all 34 cards; 0 TikTok traces in HTML/JS/data.
- SW `v28 → v29`.

Tests: parse PASS; DOM harness in ar/en/fr/es: 34 cards, 34 YouTube, **9 website**,
0 TikTok, exact 9 URLs. Live: index `a40c367c…`, SW `v29`, 0 `tiktok`, 9 URLs
present; `/`, `names.html`, `manifest.json`, `sw.js`, `images/01.jpg`, `images/34.jpg` 200.

## Session 15 — 8 more official websites + direct YouTube for Wesabi (merge `8afcf87`)
Request: add websites for #01–#09 and fix #07's YouTube link.

- Resolved the supplied `share.google` redirects to canonical sites and added:
  #01 `haithamt.com`, #02 Facebook page, #03 `samiameri.almobadarah.com`,
  #04 `waleedismail.com`, #05 `ramy-essa.com/home.aspx`, #06 `addyaiya.com`,
  #08 `islamwasat.com`, #09 `muftishamail.com`.
- #07 خالد الوصابي: no website supplied; `yt` set to
  `https://www.youtube.com/@khaledwesabi` (direct channel instead of search).
- Total non-empty websites: 17. SW `v29 → v30`.

Tests: parse PASS; DOM harness 34 cards / 34 YouTube / **17 website** / 0 TikTok;
all 8 new URLs present; #07 YouTube channel correct.
Live: index `41aacdf1…`, SW `v30`, 17 websites, 0 `tiktok`; endpoints 200.

## Session 16 — fix Qunaibi website URL (merge `f638d3f`)
Report: #10's website `https://www.iyadqunaibi.com/` did not respond.

- Resolved the supplied share link to `https://eyadqunaibi.com/` and updated #10.
- Non-empty websites remains 17; SW `v30 → v31`.

Tests: parse PASS; old URL absent, new URL present once; live index `3346ef53…`,
SW `v31`; `/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 17 — #33 replaced with Sheikh Dr. Yasir Qadhi (merge `1e0b7ba`)
Request: replace image #33 and its name with الشيخ د. ياسر قاضي, plus site and YouTube.

- New `images/33.jpg` (JPEG 816×852) installed; live hash matches local `da45aa01…`.
- #33 identity replaced in ar/en/fr/es; tag and desc updated to match (old
  `أبو عمر البديع` text removed); `website=https://www.yasirqadhi.com/`;
  `yt=https://www.youtube.com/@yasirqadhi`.
- `names.html` row 33 updated; non-empty websites now 18; SW `v31 → v32`.

Tests: parse PASS; DOM harness 34 cards, #33 name/site/YouTube correct in the four
languages, old name absent; live index `90d2c73f…`, SW `v32`, image hash matches;
`/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 18 — direct YouTube channel for Mahmoud Shaban (merge `52018ed`)
Request: fix the YouTube link for #34 الشيخ محمود شعبان.

- Set `yt=https://www.youtube.com/@dr.mahmoud_shaban` for #34 (tracking `?si=`
  removed); the button no longer falls back to a YouTube search.
- SW `v32 → v33`.

Tests: parse PASS; DOM harness 34 cards / 34 YouTube / 18 website; #34 channel
present and no search link for him. Live index `4aef9d28…`, SW `v33`;
`/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 19 — Ahmed Elsayed site added, Ajiri site removed (merge `5786930`)
Request: add the site for #12 الشيخ أحمد السيد and remove #11's site.

- Resolved the share link to `https://ahmadalsayed.net/books`; set for #12.
- Cleared `website` on #11 الدكتور عبد الله العجيري.
- Non-empty websites remains 18; SW `v33 → v34`.

Tests: parse PASS; DOM harness 34 cards / 34 YouTube / 18 website; #12 URL present,
`theodal.com` absent. Live index `1ed4990f…`, SW `v34`;
`/`, `names.html`, `manifest.json`, `sw.js` 200.

## Session 20 — session-loss recovery + state verification (docs only)

Abrupt shutdown destroyed the prior conversation state and the PAT held in it.
Recovery performed on 2026-11-17 without retyping the project history:

- Old token treated as unavailable and revoked/replaced by the user; new PAT
  validated against `GET /user` (user `ucfzem`, scopes `repo`,
  `admin:gpg_key`, `admin:ssh_signing_key`) with `push`/`admin` on the repo.
  The token was not written to disk, committed, or logged.
- Local state: no clone on disk (`/tmp/opencode/ucfz` absent); cwd `/` is not
  a git repo. Therefore no uncommitted changes, stash, lock files, partial
  writes, or detached HEAD to recover.
- Remote: `main` HEAD `5223da9` (session 19 docs); last fix `5786930`;
  0 open PRs.
- Deploy: live `index.html` SHA-256 `1ed4990f…` identical to `main@5223da9`;
  SW cache `a3lam-al-dawa-v34`. Nothing unpushed.
- No code or asset changes in this session; docs-only commit. SW cache not
  bumped (no site-facing change).

Reminder: revoke the recovery PAT after the work is finished.

## Pending milestones
1. Portraits complete (34/34); no image work remains.
2. Fonts: `fonts/` only has Scheherazade New (Cairo/Amiri absent); left unchanged
   to avoid layout shift.

## Links
- Live (GitHub Pages): https://ucfzem.github.io/a3lam-al-dawa/
- Cloudflare mirror: https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- Repo folder: https://github.com/ucfzem/ucfzem.github.io/tree/main/a3lam-al-dawa
