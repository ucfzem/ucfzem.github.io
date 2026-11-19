# Conversation backup — Cairo typography for a3lam apps (2026-11-19)

## Objective
Update typography across both webapps so that big titles and scholar/preacher names use the **Cairo** font family (Google Fonts specimen: https://fonts.google.com/specimen/Cairo, repo: https://github.com/Gue3bara/Cairo). Apply Cairo Bold (700) / SemiBold (600) to big titles and names, and Cairo Regular (400) for body/paragraph text where applicable, without breaking fallbacks, icon/RTL layout, or offline behavior.

## Environment / repo
- Deploy repo: `ucfzem/ucfzem.github.io` (branch `main`, GitHub Pages auto-deploy on push), local path `/tmp/ucfzem-site`.
- No build system/package manager for these apps (plain HTML/CSS/JS, self-contained). Verified with `node --check` on inline scripts and service worker; no linter/typechecker configured.

## a3lam-al-3olama

### Stack & relevant files (before)
- Single-page static app: `a3lam-al-3olama/index.html` (inline `<style>`, inline `<script>`, data + render). Assets in `pictures/`, `icon.svg`. No `manifest`/`sw`/`package.json`.
- Existing fonts: system/Noto fallbacks only (`body[dir="rtl"]`: "Noto Naskh Arabic","Noto Sans Arabic",Tahoma,system-ui,sans-serif; `body[dir="ltr"]`: system-ui stack). No Cairo/font files.

### Changes
- **Added (self-hosted, offline-safe):** `a3lam-al-3olama/fonts/cairo-arabic.woff2`, `cairo-latin-ext.woff2`, `cairo-latin.woff2` (Cairo v31 woff2, covering weights 400–700 via `font-weight: 400 700` range; subsets/ranges per Google Fonts CSS). `a3lam-al-3olama/Cairo-OFL.txt` (SIL OFL license).
- **Loaded/configured in `a3lam-al-3olama/index.html`:** three `@font-face` rules for `font-family: "Cairo"` (normal, 400–700, `font-display: swap`) pointing to `./fonts/cairo-*.woff2` with appropriate unicode-range (arabic, latin-ext, latin).
- **Selectors/components updated:**
  - Body/base (Regular 400, fallbacks preserved): `body[dir="rtl"] { font-family:"Cairo","Noto Naskh Arabic","Noto Sans Arabic",Tahoma,system-ui,sans-serif; font-weight:400; }`, `body[dir="ltr"] { font-family:"Cairo",system-ui,-apple-system,"Segoe UI",Arial,sans-serif; font-weight:400; }` (RTL/LTR behavior preserved).
  - Big titles / headings (Bold 700): `.page-head h1` (main page title `#ui-title`, e.g. «أعلام الدعوة»), `.scholar-card__title` (scholar/profile names in cards), `.scholar-card__label` (block/section labels, 700), `.eyebrow` (700).
  - Scholar/preacher names & emphasis (Semibold 600): `.scholar-card__role` (role/title line per scholar, 600), `.lang-btn` (600 UI labels), `.count` (600).
  - Body/lede/paragraphs (Regular 400): `.lede` (hero description), `.scholar-card__body p` (profile/bio paragraphs), inherited body text. Existing `.search-input{font-family:inherit}` and icon-free UI unaffected.

### Notes
- No SW/manifest changes (none present). Local fonts improve offline resilience vs remote fonts.

## a3lam-al-dawa

### Stack & relevant files (before)
- Single-page PWA: `a3lam-al-dawa/index.html` (inline styles/script, 34 scholars, 4 langs, themes/search), `sw.js`, `manifest.json`/`manifest.webmanifest`, `names.html`, `images/01-34.jpg`, `fonts/` (Scheherazade woff2). Build marker `2026-11-18f`, SW cache `a3lam-al-dawa-v40`.
- Existing fonts: `body` used `'Segoe UI',Tahoma,Geneva,Verdana,sans-serif`; names/titles styled but not Cairo. SVG initials avatar in JS used `Tahoma,Segoe UI,Arial,sans-serif`.

### Changes
- **Added (self-hosted, offline-safe):** `a3lam-al-dawa/fonts/cairo-arabic.woff2`, `cairo-latin-ext.woff2`, `cairo-latin.woff2` (same Cairo v31 files/subsets, 400–700). `Cairo-OFL.txt` already present.
- **Loaded/configured in `a3lam-al-dawa/index.html`:** three `@font-face` rules for `font-family: "Cairo"` (normal, 400–700, `font-display: swap`, `./fonts/cairo-*.woff2`, arabic/latin-ext/latin unicode-range).
- **Selectors/components updated in `index.html`:**
  - Body/base (Regular 400): `body{font-family:"Cairo","Segoe UI",Tahoma,Geneva,Verdana,sans-serif;font-weight:400;...}`
  - Big titles / headings (Bold 700): `h1` (main title `#title`, e.g. «أعلام الدعوة والفكر»), `.name` (scholar/preacher name in cards, `<h2 class="name">`).
  - Names/emphasis (Semibold 600): `.tag` (specialty tag per scholar, 600), `.pill button` (lang/theme controls, 600), `.btn` (action buttons, 600).
  - Body/paragraphs/subtitles (Regular 400): `.desc` (scholar bio paragraphs, justified 2-paragraph narratives), `.subtitle`, `.count`, `footer`.
  - SVG initials avatar (fallback when no photo): inline JS `initials()` uses `font-family="Cairo,Tahoma,Segoe UI,Arial,sans-serif"` with `font-weight="700"` for the initial letter.
  - Build marker bumped: `build 2026-11-18f` → `build 2026-11-19a`.
- **`a3lam-al-dawa/names.html`:** added Cairo `@font-face` rules; applied Cairo to `body` (400), `h1` (700, page title «أسماء الأعلام»), `.nm` (name entries, 600), `.sub` (400), `.num` (700). Content/list unchanged.
- **`a3lam-al-dawa/sw.js`:** cache `a3lam-al-dawa-v40` → `a3lam-al-dawa-v41`; added `./fonts/cairo-arabic.woff2`, `./fonts/cairo-latin-ext.woff2`, `./fonts/cairo-latin.woff2` to precache (`cache.addAll`) to keep offline/PWA behavior intact.

## Verification
- `git status` / `git diff`: only intended files modified/added in `a3lam-al-3olama` and `a3lam-al-dawa` (no unrelated files changed; `works/`, `works/Maktaba` untouched).
- Syntax/CSS/assets checks: `node --check a3lam-al-dawa/sw.js` OK; `node --check` on extracted inline `<script>` blocks — a3lam-al-dawa (2 blocks) OK, a3lam-al-3olama (1 block) OK. HTML/CSS edits are targeted selector/font-face insertions; no lint/typecheck/build tooling present in these static apps.
- Data/schema/localization preserved: scholar entries, names, bios, tags, links, ordering, AR/EN/FR/ES i18n, themes/search, RTL/LTR `dir` handling, images/manifest intact.

## Visual check suggestions
- Confirm Cairo renders for main page titles (`h1`), each scholar/preacher name (`.scholar-card__title` in 3olama; `.name` in dawa cards), role/subtitle lines, and bio/body paragraphs in AR/FR/EN/ES (and RTL/LTR) on both apps.
- a3lam-al-dawa: verify PWA/offline still loads fonts after SW update (cache v41) and that `names.html` displays names in Cairo; avatar-initial SVG fallback shows Cairo glyph when an image is missing.
- Spot-check on devices/browsers where `font-weight` range (400–700 in one woff2) is used — widely supported; if any very old browser needs discrete weights, consider adding separate 400/600/700 files later (not required now).

## Modified/added files (this change)
- `a3lam-al-3olama/index.html`
- `a3lam-al-3olama/fonts/cairo-arabic.woff2`
- `a3lam-al-3olama/fonts/cairo-latin-ext.woff2`
- `a3lam-al-3olama/fonts/cairo-latin.woff2`
- `a3lam-al-3olama/Cairo-OFL.txt`
- `a3lam-al-dawa/index.html`
- `a3lam-al-dawa/names.html`
- `a3lam-al-dawa/sw.js`
- `a3lam-al-dawa/fonts/cairo-arabic.woff2`
- `a3lam-al-dawa/fonts/cairo-latin-ext.woff2`
- `a3lam-al-dawa/fonts/cairo-latin.woff2`
- `CONVERSATION-2026-11-19-cairo-typography.md` (this backup)
