# Recovery, Repair & Offline Log — 2026-11-02

Accurate summary of this session. No secrets/tokens are stored in this file.

## TL;DR

The site `ucfzem.github.io` had been reduced to almost nothing by an earlier
force-push (a sparse/incomplete clone was pushed over `main`). This session
recovered the real state from still-reachable old commits, restored the root
homepage, all Maktaba book folders, all web apps, and both service workers.

## Root cause

- The working tree of `main` had been rebuilt from an **older lineage
  (`4fdee94`)** that contained only icon stubs for most books and a tiny
  `index.html` that **redirected `/` to `/basair02/index.html`**.
- A later good state existed at commit `895dd7af7` (2026-11-02 10:28,
  "Restore root index.html") and `37665e2bb` (2026-11-01 03:52), but `main`
  was on the older lineage, so those folders/redirect fixes were missing.
- The app folders still existed in GitHub's object store, reachable by SHA, so
  nothing was permanently lost.

## What was restored (from `895dd7af7` and `37665e2bb`)

- **Root homepage**: real `UcfZem` landing page (7.7 KB) replacing the
  `basair02` redirect. `basair02` still lives at its own URL.
- **12 Maktaba book folders** that were `icon.svg`-only, restored in full:
  `ajayib-al-makhluqat`, `al-ajwiba-al-musaddada`, `al-bishara`,
  `al-jawab-al-sahih`, `al-masalik-wa-al-mamalik`, `izhar-al-haqq`,
  `kharidat-al-ajaib`, `mapamundi`, `masoudi-encyclopedia`, `musawa-qasas`,
  `sifat-al-safwa`, `tafsir-ibn-taymiyyah`.
- **Web apps**: `droppy`, `webhealth`, `email-collector`, `barnabas`,
  `childsgame`, `pixellapp`, `sport`, `voxforge`, `web-dev`, `rafeeq`,
  `remedy`, plus `cv-maker`, `pristine`, `sounds-of-nature`, `image2prompt`,
  `ucfzem-ai`, and `chat-socketio` (linked from the homepage).
- **works page JS**: fixed a corrupted `ico()` (duplicate/missing `f`) and an
  empty `renderPublic() {}` that made the page render 0 cards. Now 44 cards.

## Link policy (original origins)

The Cloudflare worker `https://ucfzem.azer-tyu199p.workers.dev` **proxies the
repo** (its paths 404'd before the folders were restored, 200 after), and it
also provides the backend for forms/uploads. So the named apps point at their
original origins, not `github.io`:

| App | Original link |
|---|---|
| Droppy | https://ucfzem.azer-tyu199p.workers.dev/droppy/ |
| WebHealth | https://ucfzem.azer-tyu199p.workers.dev/webhealth/ |
| EmailCollector | https://ucfzem.azer-tyu199p.workers.dev/email-collector/ |
| Rafeeq | https://ucfzem.azer-tyu199p.workers.dev/rafeeq/ |
| Al-Istibsar | https://ucfzem.azer-tyu199p.workers.dev/livre-al-istibsar/ |
| Remèdes | https://remedy-eight.vercel.app/ |

Book projects remain on `github.io` (the worker returns 404 for several of
them).

## Offline mode (PWA)

- **Root `/sw.js` was missing (404)** even though the homepage and `/works`
  both register it → site-wide offline was broken. Restored the 16 KB root
  worker (scope `/`): precaches every app shell + icons + manifests + CDN fonts
  + book data, and answers bare `/app` redirects offline.
- **`/works/sw.js`** bumped to **`v1.0.26`**: CORE now precaches every icon and
  asset the works page uses (added `al-a3chab-attebiah`, `izhar-al-haqq`,
  `tafsir-ibn-taymiyyah`; removed 2 dead `sahih-al-qasas` entries). Uses
  `ignoreSearch` so versioned params (`?v=1`) resolve offline.
- All CORE URLs and all app `index.html` shells verified `200`; both SWs served
  as `application/javascript`.

## Verification

- Root `/` title = `UcfZem`, no redirect.
- Full works-page link scan: **105/105 return 200** (only
  `works-validator` = 405, a POST-only API — expected).
- Note: a true airplane-mode test must be done on a device (no headless browser
  in the repair environment). Open `/works/` once online to populate the
  `v1.0.26` cache, then test offline.

## Live links

| Resource | URL |
|---|---|
| Home | https://ucfzem.github.io/ |
| Works / Maktaba | https://ucfzem.github.io/works/ |
| Repo | https://github.com/ucfzem/ucfzem.github.io |
| Basa'ir | https://ucfzem.github.io/basair/ |
| Basa'ir 02 | https://ucfzem.github.io/basair02/ |
| Mirqat al-Tawhid | https://ucfzem.github.io/mirqat-tawhid/ |
| Remedy (Vercel) | https://remedy-eight.vercel.app/ |
| Remedy (Pages) | https://ucfzem.github.io/remedy/ |
| This log | https://ucfzem.github.io/CONVERSATION-RECOVERY-2026-11-02.md |
