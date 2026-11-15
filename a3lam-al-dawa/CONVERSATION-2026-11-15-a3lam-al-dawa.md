# Conversation Backup — A3lam al-Dawa PWA

**Date:** 2026-11-15
**Task:** Finish, integrate, deploy, and verify the new Arabic-first PWA **أعلام الدعوة والفكر والمناظرة في العصر الرقمي**, add it to Maktaba and the Works hub, then back up the conversation.

## Scope

- New app: https://ucfzem.github.io/a3lam-al-dawa/
- New app (Cloudflare proxy): https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Maktaba (Cloudflare proxy): https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/
- Works hub: https://ucfzem.github.io/works/
- Works hub (Cloudflare proxy): https://ucfzem.azer-tyu199p.workers.dev/works/

## Deliverable

- Added `/a3lam-al-dawa/` as a self-contained PWA.
- `index.html` is about 432 KB and embeds Amiri and Cairo WOFF2 fonts locally.
- Content: 12 figures across 4 categories, including **الشيخ عثمان الخميس** and **الشيخ عدنان العرعور**.
- Languages: Arabic (default, RTL), English, French, Spanish.
- Themes: Sépia, Clair, Sombre.
- Reading controls: A+ / A− text scaling.
- Smart search: Arabic normalization, tashkeel-insensitive matching, highlighted matches, word/match counters, empty state.
- Persistence: language, theme, and reading size stored in `localStorage` under `a3lam-*` keys.
- Channel chips use safe generated YouTube search URLs rather than guessed channel IDs.
- Added `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-180.png`, `icon-192.png`, `icon-512.png`, plus `Amiri-OFL.txt` and `Cairo-OFL.txt`.
- App cache: `a3lam-al-dawa-2026-11-15-2`.

## Integration

### Maktaba

- Added a full-width **أعلام الدعوة والفكر والمناظرة** card after **Quran Majeed v3** and before the Tanger/Mapamundi pair.
- App link points to the public GitHub Pages app.
- Icon: `https://ucfzem.github.io/a3lam-al-dawa/icon.svg`.
- Preserved all 29 library app rows.
- Maktaba now displays 4 webapp cards, matching the existing “4 apps” label.
- Added `</div>` to correctly close `.webapp-stack` without changing layout.
- Bumped Maktaba cache: `maktaba-main-v3` → `maktaba-main-v4`.
- Added the new app icon to the Maktaba service-worker precache list.

### Works hub

- Added `publicProjects` entry `num: 19`:
  - Name: `أعلام الدعوة والفكر والمناظرة`
  - Tag: `Directory`
  - Icon: `https://ucfzem.github.io/a3lam-al-dawa/icon.svg`
  - URL: `https://ucfzem.github.io/a3lam-al-dawa/`
  - Opens in a new tab.
- Fixed the icon `onerror` handler in `ico()`: the generated `<img>` tag was missing its closing quote/`>`, which raised `Unexpected end of input` whenever an icon failed.
- Bumped Works cache: `maktaba-v11` → `maktaba-v13`.

## Service-worker safety fix

- The new app service worker originally deleted **every** cache on `ucfzem.github.io`, which could remove other apps’ offline data.
- Changed activation cleanup to delete only caches starting with `a3lam-al-dawa-`.
- The Works root service worker similarly deleted every `maktaba-*` cache, including Maktaba’s separate `maktaba-main-*` cache.
- Changed Works cleanup to delete only `maktaba-v*` caches, preserving `maktaba-main-*`.
- Verified with Playwright:
  - App activation removed `a3lam-al-dawa-oldtest` but preserved `other-site-cache`.
  - Works activation removed `maktaba-v11` but preserved `maktaba-main-v4`.

## Verification

Local Playwright checks:

- Maktaba: 4 webapp cards, 29 app rows, correct new card position and link, no mobile overflow.
- Works: new card found, number `19`, correct tag/link/icon, no mobile overflow.
- App: 12 figures, 4 languages, Arabic title, no mobile overflow.
- Search for `الخميس`: 1 visible figure, 2 highlighted matches, correct counters.
- Full app suite passed: all 4 languages, 3 themes, tashkeel-insensitive search, counters, channel URLs, persistence, mobile layout, and offline reload.
- No page errors or console errors.

Live checks after GitHub Pages deployment:

- GitHub and Cloudflare app URLs return `200`.
- Icon, manifest, and service worker return `200`.
- Maktaba GitHub and Cloudflare pages show the new card.
- Works GitHub and Cloudflare pages show the new project at `num: 19`.
- Live offline reloads return `200` for the app (12 figures), Maktaba (4 webapps / 29 rows), and Works (new card present).
- Live app service worker: `a3lam-al-dawa-2026-11-15-2`.
- Live Maktaba service worker: `maktaba-main-v4`.
- Live Works service worker: `maktaba-v13`.

## Commits

- `4d74604` — Add A3lam al-Dawa PWA to Maktaba and works
- `4a57d9c` — Scope service worker cache cleanup per app
- Repository: https://github.com/ucfzem/ucfzem.github.io

## Live links

- App: https://ucfzem.github.io/a3lam-al-dawa/
- App manifest: https://ucfzem.github.io/a3lam-al-dawa/manifest.webmanifest
- App service worker: https://ucfzem.github.io/a3lam-al-dawa/sw.js
- App icon: https://ucfzem.github.io/a3lam-al-dawa/icon.svg
- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Maktaba (Cloudflare): https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/
- Works hub: https://ucfzem.github.io/works/
- Works hub (Cloudflare): https://ucfzem.azer-tyu199p.workers.dev/works/
- Commit: https://github.com/ucfzem/ucfzem.github.io/commit/4d74604
- Cache-scope fix: https://github.com/ucfzem/ucfzem.github.io/commit/4a57d9c

## Update — Cloudflare proxy links

**Commit:** `3154eae` — Link A3lam al-Dawa through Cloudflare proxy

- Updated the Maktaba webapp card to open the app through the Cloudflare proxy:
  `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/`
- Updated the Works hub `num: 19` entry to the same Cloudflare URL.
- Bumped Maktaba cache to `maktaba-main-v5`.
- Bumped Works cache to `maktaba-v14`.
- Verified live:
  - Maktaba still has 4 webapp cards and 29 library rows.
  - Maktaba card link targets the Cloudflare app URL.
  - Works entry `#19` targets the Cloudflare app URL and its icon loads.
  - Cloudflare app URL returns `200` with 12 figures and 4 languages.
  - No page or console errors.
- Commit: https://github.com/ucfzem/ucfzem.github.io/commit/3154eae
