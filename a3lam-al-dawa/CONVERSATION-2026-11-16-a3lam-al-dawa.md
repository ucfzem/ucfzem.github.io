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

## Pending milestones
1. Verify the best-effort Arabic names against a source (#31 `محمد بن سن الدين`,
   #36 `أبو عمر البديع` in particular). #32/33/34/35 now follow supplied spellings.
2. Add `images/01.jpg` … `images/38.jpg` (folder is empty; never in git history).
   SW already precaches two-digit lowercase `./images/XX.jpg`; bump after upload.
3. Fonts: `fonts/` only has Scheherazade New (Cairo/Amiri absent); left unchanged
   to avoid layout shift.

## Links
- Live (GitHub Pages): https://ucfzem.github.io/a3lam-al-dawa/
- Cloudflare mirror: https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- Repo folder: https://github.com/ucfzem/ucfzem.github.io/tree/main/a3lam-al-dawa
