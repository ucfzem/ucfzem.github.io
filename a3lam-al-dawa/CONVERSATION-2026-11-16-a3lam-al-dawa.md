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

## Pending milestones
1. Re-supply Arabic content for the 14 unmatched entries (descriptions still
   Latin; names #31–36 still transliterated).
2. Add `images/01.jpg` … `images/38.jpg` (currently `images/` is empty; SW naming
   is already two-digit lowercase `./images/XX.jpg`). Until then SVG initials show.
3. Manifest reconciliation (name "أعلام الدعوة والفكر", colors #121212 vs current #1b5e3a).
4. Fonts: `fonts/` only has Scheherazade New (Cairo/Amiri absent); left unchanged
   to avoid layout shift.

## Links
- Live (GitHub Pages): https://ucfzem.github.io/a3lam-al-dawa/
- Cloudflare mirror: https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- Repo folder: https://github.com/ucfzem/ucfzem.github.io/tree/main/a3lam-al-dawa
