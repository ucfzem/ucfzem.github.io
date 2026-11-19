# Conversation Backup — shubuhat-wa-rudud (blocked, pending content) — 2026-11-19

## Objective
- Maintain `a3lam-al-dawa` and `a3lam-al-3olama` in `ucfzem/ucfzem.github.io` (Cairo typography applied, works/Maktaba links intact) and add the new `shubuhat-wa-rudud` project to Maktaba and works (both) using provided assets, then test/deploy/backup/share links.

## Important Details
- **Repo/deploy:** `ucfzem/ucfzem.github.io`, branch `main`, GitHub Pages auto-deploys on push. Deploy repo `/tmp/ucfzem-site` (sparse checkout). Git push works via stored credentials; `GH_TOKEN` absent; do not echo tokens. No force-push/reset/clean; check `git status`/`git diff` before commits; avoid unrelated deletions/overwrites.
- **Constraints/directives:** Preserve schema/localization/tags/links/CSS/SW/offline behavior and existing sites/apps. `https://ucfzem.github.io/works/Maktaba` must remain safe; add new unlocked/webapp entries carefully (additive). Test, commit/push/deploy, save/backup conversation GitHub `.md`, share all relevant links.
- **`a3lam-al-3olama`:** Live `https://ucfzem.github.io/a3lam-al-3olama/` (27 scholars, enriched AR/EN/FR/ES, portraits, offline-safe, Cairo typography self-hosted/applied). Commit `4481658`.
- **`a3lam-al-dawa`:** Live `https://ucfzem.github.io/a3lam-al-dawa/` (worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/`), 34 entries, Cairo typography/build `2026-11-19a`, SW `a3lam-al-dawa-v41` (fonts precached). Commit `4481658`.
- **`works` / Maktaba (inspected):** `works/index.html` unlocked/public includes `a3lam-al-dawa` (#19, worker URL) and `a3lam-al-3olama` (#20) as cards and a `Maktaba` folder (`maktaba` array inside, opened) with numbered books/apps; public count dynamic `publicProjects.length + maktaba.length` (19 + 31 = 50). `works/sw.js` `maktaba-v15` precaches app icons incl. a3lam icons. `works/Maktaba/index.html` lists 5 webapps (Quran Majeed v3, A3lam al-Dawa, A3lam al-3olama, Tanger, Mapamundi) and a library of Arabic books/apps with counts/titles/tags and QR section; `works/Maktaba/sw.js` present. Commits `5977d43`, `439fce0`.
- **Requested addition:** Add `shubuhat-wa-rudud` to link tree at `ucfzem.github.io/works` (Maktaba folder/unlocked webapps area) and in `ucfzem.github.io/works/Maktaba/` alongside other webapps, carefully/additively, choose good icon. Metadata specified by user: Folder `shubuhat-wa-rudud/`, AR Title `شبهات وردود — ضوابط المنهج الشرعي`, EN Title `Shubuhat wa Rudud`, Tags `العقيدة والمنهج`, `السنة والصحيحين`, `الرد على الشبهات`. Instruction: create from Arabic academic study in conversation ("ضوابط المنهج الشرعي في تلقي العلم، ونقد الإشكالات المنهجية في خطاب بعض المتصدرين المعاصرين، والرد على دعاوى التيار القرآني، مع بيان منزلة السنة والصحيحين"), following conventions of sibling apps in `works/Maktaba/` and repo.

## Work State
### Completed
- `a3lam-al-3olama` and `a3lam-al-dawa` maintained (Cairo typography applied/deployed, content/links preserved) — `4481658`.
- `a3lam-al-3olama` added to works link tree and SW bumped — `5977d43`, `439fce0`.
- Repo inspected for `shubuhat*`, sibling app conventions (`works/index.html`, `works/Maktaba/index.html`, `works/sw.js`, `works/Maktaba/`, `a3lam-al-dawa`), and environment: no `shubuhat*` exists; no study/file contents found.
- Conversation backups committed/pushed: `CONVERSATION-2026-11-19-cairo-typography.md`, `works/CONVERSATION-2026-11-19-works-links.md`, this file updated.

### Active
- None (no project files created/modified).

### Blocked
- **Missing source content:** The Arabic academic study text ("ضوابط المنهج الشرعي...") and the “last version” project file contents (`index.html`, `assets/css/style.css`, `assets/js/app.js`, `assets/data/content.json`, `opencode.json`, `AGENTS.md`) are not present in this conversation or on disk in `/tmp/ucfzem-site`. Cannot invent or approximate scholarly content; `shubuhat-wa-rudud/` not created and no listings added.
- **Still to confirm once content provided (if not specified in files):** exact icon asset/SVG, canonical URL/hosting (GitHub Pages path vs worker), and precise Maktaba/works placement/count/SW-cache updates consistent with sibling conventions.

## Next Move
1. Obtain the Arabic study text and/or the exact `shubuhat-wa-rudud` file contents (`index.html`, `assets/css/style.css`, `assets/js/app.js`, `assets/data/content.json`, `opencode.json`, `AGENTS.md`).
2. Create `shubuhat-wa-rudud/` from that content following sibling app conventions, add a fitting icon, and add it additively to `works/index.html` and `works/Maktaba/index.html` (and update relevant SWs/counts/metadata) without breaking existing entries.
3. Verify, `git status`/`git diff`, commit/push to `main`, confirm Pages deploy, save/update conversation backup `.md`, and share all links.

## Relevant Files
- `/tmp/ucfzem-site/works/index.html` (public unlocked + Maktaba folder arrays, dynamic count)
- `/tmp/ucfzem-site/works/sw.js` (`maktaba-v15`)
- `/tmp/ucfzem-site/works/Maktaba/index.html`
- `/tmp/ucfzem-site/works/Maktaba/sw.js`
- `/tmp/ucfzem-site/a3lam-al-dawa/` (sibling app convention reference)
- `/tmp/ucfzem-site/CONVERSATION-2026-11-19-shubuhat-wa-rudud.md` (this backup)

## Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Backup (this file): https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-shubuhat-wa-rudud.md
- Prior backups: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-cairo-typography.md , https://github.com/ucfzem/ucfzem.github.io/blob/main/works/CONVERSATION-2026-11-19-works-links.md
- Deployed: https://ucfzem.github.io/works/ , https://ucfzem.github.io/works/Maktaba/ , https://ucfzem.github.io/a3lam-al-dawa/ , https://ucfzem.github.io/a3lam-al-3olama/ , https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
