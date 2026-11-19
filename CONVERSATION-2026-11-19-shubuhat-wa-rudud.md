# Conversation Backup — shubuhat-wa-rudud (pending) — 2026-11-19

## Objective
- Maintain `a3lam-al-dawa` and `a3lam-al-3olama` in `ucfzem/ucfzem.github.io` (Cairo typography applied, works/Maktaba links intact) and add the new `shubuhat-wa-rudud` project to Maktaba and works (both) using provided assets, then test/deploy/backup/share links.

## Important Details
- **Repo/deploy:** `ucfzem/ucfzem.github.io`, branch `main`, GitHub Pages auto-deploys on push. Deploy repo `/tmp/ucfzem-site` (sparse checkout). Git push works via stored credentials; `GH_TOKEN` absent; do not echo tokens. No force-push/reset/clean; check `git status`/`git diff` before commits; avoid unrelated deletions/overwrites.
- **Constraints/directives:** Preserve schema/localization/tags/links/CSS/SW/offline behavior and existing sites/apps. `https://ucfzem.github.io/works/Maktaba` must remain safe; add new unlocked/webapp entries carefully (additive). Test, commit/push/deploy, save/backup conversation GitHub `.md`, share all relevant links.
- **`a3lam-al-3olama`:** Live `https://ucfzem.github.io/a3lam-al-3olama/` (do not overwrite `/a3lam-al-dawa/`). 27 scholars, enriched AR/EN/FR/ES bios/series, 27 portraits, offline-safe, Cairo typography self-hosted/applied (`fonts/cairo-{arabic,latin-ext,latin}.woff2`, `Cairo-OFL.txt`, Cairo 700/600 titles/names/labels, 400 body). No SW/manifest. Commit `4481658`.
- **`a3lam-al-dawa`:** Live `https://ucfzem.github.io/a3lam-al-dawa/`, worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/`. 34 entries, schema/keys/localization/themes/search/images/manifests/offline preserved, rich `desc.*` narratives. Cairo typography applied (build `2026-11-19a`, SW cache `a3lam-al-dawa-v41`, fonts precached; `index.html`/`names.html`/SVG avatar initials updated). Commit `4481658`.
- **`works` / Maktaba:** `works/index.html` unlocked/public includes `a3lam-al-dawa` (#19, icon `https://ucfzem.github.io/a3lam-al-dawa/icon.svg`, worker URL) and `a3lam-al-3olama` (#20, icon `https://ucfzem.github.io/a3lam-al-3olama/icon.svg`, `newTab: true`) with no other entries altered; public count dynamic (`publicProjects.length + maktaba.length`, 19 + 31 = 50). `works/sw.js` `maktaba-v15` precaches both a3lam icons. `works/Maktaba/index.html` and `works/Maktaba/sw.js` already listed both apps/icons (untouched). Commits `5977d43`, `439fce0`.
- **New project request (pending):** User requested new Maktaba project `shubuhat-wa-rudud` listed in **both** Maktaba and works. Provided structure/files: `shubuhat-wa-rudud/{index.html, assets/css/style.css, assets/js/app.js, assets/data/content.json, opencode.json, AGENTS.md}` with full contents supplied for `assets/data/content.json`, `assets/css/style.css`, `assets/js/app.js`, `opencode.json`, `AGENTS.md`.
- **Backups/commits (recent):** `5977d43` feat(works): add a3lam-al-3olama to link tree and bump SW cache; `439fce0` docs(works): add conversation backup for a3lam links update (`works/CONVERSATION-2026-11-19-works-links.md`); `4481658` style(a3lam): apply Cairo typography to titles and scholar names (`CONVERSATION-2026-11-19-cairo-typography.md`). Pushed to `main`.

## Work State
### Completed
- `a3lam-al-3olama`: preserved and Cairo typography applied/deployed (`4481658`).
- `a3lam-al-dawa`: prior enrichments/corrections preserved; Cairo typography applied/deployed (`4481658`, build `2026-11-19a`, SW v41).
- `works`: `a3lam-al-3olama` added to link tree (additive), public count made dynamic, `works/sw.js` bumped to `maktaba-v15`; Maktaba app listings left untouched. Verified/committed/pushed (`5977d43`, `439fce0`).
- Conversation backups present: `works/CONVERSATION-2026-11-19-works-links.md`, `CONVERSATION-2026-11-19-cairo-typography.md`.
- Pre-flight checks for continuation: repo clean at `4481658`, no unrelated changes, no existing `shubuhat*` files.

### Active
- `shubuhat-wa-rudud`: user provided `assets/data/content.json`, `assets/css/style.css`, `assets/js/app.js`, `opencode.json`, `AGENTS.md` contents; project directory not created and no listings updated yet.

### Blocked
- **Missing `shubuhat-wa-rudud/index.html`** (stated as already provided but not included in conversation).
- **Unconfirmed listing/integration details required for faithful "both Maktaba and works" addition:** icon asset/URL, Arabic and English card title, short tag/description, canonical slug/path/URL, Maktaba classification/section (webapp/books) and exact entry format, works placement (unlocked/public vs maktaba array), whether to add to Maktaba/works service workers and manifests, and any worker URL.

## Next Move
1. Obtain `shubuhat-wa-rudud/index.html` and confirm listing details (icon, AR/EN title, tag/description, slug/URL, Maktaba section/format, works placement, SW/manifest expectations).
2. Create `shubuhat-wa-rudud/` with all provided/confirmed files, add it additively to `works/Maktaba/index.html` and `works/index.html` (and update relevant SWs/counts if needed) without breaking existing entries or schema/localization/CSS/SW/offline behavior of other apps.
3. Verify (structure/JSON/JS syntax/links), `git status`/`git diff`, commit/push to `main`, confirm deploy, save/update conversation backup `.md`, and share all links.

## Relevant Files
- `/tmp/ucfzem-site/shubuhat-wa-rudud/` (to create): `index.html` (missing), `assets/css/style.css`, `assets/js/app.js`, `assets/data/content.json`, `opencode.json`, `AGENTS.md` (contents provided by user).
- `/tmp/ucfzem-site/works/index.html`: works/link tree (public unlocked + maktaba arrays, dynamic count); additive target for new app.
- `/tmp/ucfzem-site/works/sw.js`: `maktaba-v15`; review if new icon/assets must be precached.
- `/tmp/ucfzem-site/works/Maktaba/index.html`: Maktaba listings; must remain safe, additive target for new app.
- `/tmp/ucfzem-site/works/Maktaba/sw.js`: Maktaba SW; review/update only if required.
- `/tmp/ucfzem-site/CONVERSATION-2026-11-19-cairo-typography.md`: prior backup (Cairo typography).
- `/tmp/ucfzem-site/works/CONVERSATION-2026-11-19-works-links.md`: prior backup (works links).
- `https://github.com/ucfzem/ucfzem.github.io` (main, HEAD `4481658` at backup time)
- `https://ucfzem.github.io/works/`
- `https://ucfzem.github.io/works/Maktaba/`
- `https://ucfzem.github.io/a3lam-al-dawa/`
- `https://ucfzem.github.io/a3lam-al-3olama/`
- `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/`
