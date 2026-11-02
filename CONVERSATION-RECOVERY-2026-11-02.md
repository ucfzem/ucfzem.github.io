# Recovery & Repair Log — 2026-11-02

Session summary: restored the `works` (Maktaba) page, fixed a broken JavaScript
edit, converted asset paths to relative, restored 12 project icons, and deployed
the Remedy webapp to GitHub Pages with offline (PWA) support.

> Note: no secrets/tokens are stored in this file.

## Context

- A prior session lost context after an abrupt shutdown, including a GitHub PAT.
- The repository `ucfzem/ucfzem.github.io` had been left in a reduced state:
  only `.nojekyll`, `index.html` and `basair02/` were present on `main`.
- A local clone existed at `/tmp/opencode/ucfzem-site` with a full backup of
  `works/` at `/root/backup_works_2026-10-30/works`.

## What was restored

1. **`works/` (Maktaba / linktree)** — restored from the Oct 30 backup:
   `index.html`, `sw.js`, `fonts.css`, `fonts/`, `assets/` (avatar, maktaba,
   remedy, tanger, tarikh-ibn-khaldun, barnabas, mirqat-tawhid, quran, cv, etc.).
2. **`basair/`** — restored (fonts, icons, index, manifest, sw, content-i18n).
3. **`mirqat-tawhid/`** — restored from the Mirqat backup.
4. **12 replacement project icons** at the repo root
   (`<project>/icon.svg`): sifat-al-safwa, ajayib-al-makhluqat,
   al-masalik-wa-al-mamalik, kharidat-al-ajaib, masoudi-encyclopedia,
   musawa-qasas, al-ajwiba-al-musaddada, al-bishara, al-jawab-al-sahih,
   izhar-al-haqq, tafsir-ibn-taymiyyah, mapamundi.

## Critical bug fixed

A previous edit corrupted `works/index.html`:

```js
   unction ico(p) { ... }   // missing "f", duplicated
unction ico(p) { ... }
function renderPublic() {}   // empty braces closed the function early
    const container = ...
```

The browser threw a SyntaxError and rendered **zero** project cards.

Fixed to a single, valid function and a properly opened `renderPublic()`:

```js
function ico(p) {
  return p.icon
    ? `<img src="${p.icon}" class="card-icon" alt="" onerror="this.replaceWith(Object.assign(document.createElement("span"),{className:"card-emoji",textContent:"${p.emoji}"}))>`
    : `<span class="card-emoji">${p.emoji}</span>`;
}

function renderPublic() {
    const container = document.getElementById('publicProjects');
```

Verified live: 44 project cards, 10 folder sections, 28 Maktaba cards render,
no JS errors (jsdom test).

## Path fixes (relative instead of domain-absolute)

- `https://ucfzem.github.io/works/assets/...` → `./assets/...` (11 references).
- Kept `og:image` / `twitter:image` absolute for social/SEO.
- Result: assets load both locally (`file://`) and under `/works/` on Pages.

## Remedy webapp

- Source: standalone `index.html` (~176 KB), FR/EN/ES/AR, light/dark, search,
  language persistence; only external dep is the Google "Alexandria" font.
- Deployed to GitHub Pages at `/remedy/` with offline support:
  - `manifest.json` (standalone, theme `#708238`, icon)
  - `sw.js` (`remedy-v1.0.0`, cache-first for assets, network-first navigation)
  - `icon.svg` (sage green with gold frame)
  - `index.html` patched with manifest link, theme-color, apple-touch-icon and
    service-worker registration.
- The `works` page "Remèdes" entry links to `https://remedy-eight.vercel.app/`
  and uses `./assets/remedy.svg` for its icon.

## Known 404 projects (separate repos, not in backup)

These pages return 404 because their standalone GitHub repos no longer exist:
`droppy`, `webhealth`, `email-collector`, `remedy` (GitHub Pages; Vercel copy
is live), plus `rafeeq-health` and `al-istibsar`. The `ico(p)` fallback shows
the project emoji for cards without a reachable icon.

## Live links

| Resource | URL |
|---|---|
| Works / Maktaba | https://ucfzem.github.io/works/ |
| Remedy (GitHub Pages, offline) | https://ucfzem.github.io/remedy/ |
| Remedy (Vercel) | https://remedy-eight.vercel.app/ |
| Basa'ir | https://ucfzem.github.io/basair/ |
| Mirqat al-Tawhid | https://ucfzem.github.io/mirqat-tawhid/ |
| Root hub | https://ucfzem.github.io/ |
| Repo | https://github.com/ucfzem/ucfzem.github.io |
| This log | https://ucfzem.github.io/CONVERSATION-RECOVERY-2026-11-02.md |
