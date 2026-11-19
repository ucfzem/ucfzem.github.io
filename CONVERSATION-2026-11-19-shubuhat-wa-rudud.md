# Conversation Backup — shubuhat-wa-rudud integration — 2026-11-19

## Objective
- Maintain `a3lam-al-dawa` and `a3lam-al-3olama` in `ucfzem/ucfzem.github.io` (typography/links intact), add/integrate `shubuhat-wa-rudud` (last provided expanded version) into both `works/index.html` and `works/Maktaba/` additively with a fitting icon, then verify, commit/push/deploy, save/update this backup, and share all links.

## Important Details
- **Repo/deploy:** `ucfzem/ucfzem.github.io`, branch `main`, GitHub Pages auto-deploys on push. Deploy repo `/tmp/ucfzem-site`. Git push via stored credentials; `GH_TOKEN` absent (no tokens echoed). No force-push/reset/clean; `git status`/`git diff` checked before commits; no unrelated deletions/overwrites.
- **Constraints/directives:** Preserved schema/localization/tags/links/CSS/SW/offline behavior and existing sites/apps. `https://ucfzem.github.io/works/Maktaba` kept safe; new unlocked/webapp entry added carefully and additively.
- **`shubuhat-wa-rudud` (implemented):** Folder `shubuhat-wa-rudud/` at repo root with provided last/expanded self-contained `index.html` (“شبهات وردود — دراسة علمية نقدية موسّعة”, `lang="ar" dir="rtl"`, 6-part study with inline CSS/JS, Google Fonts Amiri/Aref Ruqaa/Cairo/Scheherazade New, search/TOC/theme/font-size/progress/reading-position, localStorage keys `shubuhat_theme_v1`, `shubuhat_font_v1`, `shubuhat_size_v1`, `shubuhat_last_part_v1`) and fitting `icon.svg` (shield + open book, green/gold, sibling-style). URL: `https://ucfzem.github.io/shubuhat-wa-rudud/`.
- **Metadata/tags:** AR title `شبهات وردود — ضوابط المنهج الشرعي`, EN title `Shubuhat wa Rudud`, tags/context `العقيدة والمنهج` / `السنة والصحيحين` / `الرد على الشبهات`.
- **`works/index.html`:** Added as public project #21 (`🛡️`, icon `https://ucfzem.github.io/shubuhat-wa-rudud/icon.svg`, URL `https://ucfzem.github.io/shubuhat-wa-rudud/`, `newTab: true`, tag `العقيدة والمنهج`) after A3lam al-3olama; public count remains dynamic `publicProjects.length + maktaba.length` (now 20 + 31 = 51).
- **`works/Maktaba/index.html`:** Added as 6th webapp card alongside other webapps (after A3lam al-3olama) with icon/title/tags and external link; updated header/meta/counts to “29 Arabic books & 6 webapps · UcfZem” and “Webapps … 6 apps” (library remains 29 `app-row`s).
- **Service workers (additive cache bumps):** `works/sw.js` `maktaba-v15` → `maktaba-v16` with `https://ucfzem.github.io/shubuhat-wa-rudud/icon.svg` precached; `works/Maktaba/sw.js` `maktaba-main-v6` → `maktaba-main-v7` with same icon in `EXTERNAL`.
- **Preserved apps:** `a3lam-al-3olama` live `https://ucfzem.github.io/a3lam-al-3olama/` (commit `4481658` chain) and `a3lam-al-dawa` live `https://ucfzem.github.io/a3lam-al-dawa/` / worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/` (Cairo, build `2026-11-19a`, SW `a3lam-al-dawa-v41`) unchanged.
- **Prior context/commits:** `5977d43` `feat(works): add a3lam-al-3olama to link tree and bump SW cache`; `439fce0` `docs(works): add conversation backup for a3lam links update`; `4481658` `style(a3lam): apply Cairo typography to titles and scholar names`; `73c2540`/`c936445` prior (blocked/pending) backups for shubuhat-wa-rudud.

## Work State
### Completed
- Created `shubuhat-wa-rudud/` with provided expanded `index.html` and fitting `icon.svg`.
- Integrated additively into `works/index.html` and `works/Maktaba/index.html` with requested metadata/tags; updated relevant counts/meta and bumped `works/sw.js`/`works/Maktaba/sw.js` caches; no unrelated files changed.
- Verified via `git status`/`git diff --stat`, content/grep checks (new URLs/icons present, counts consistent: 6 webapp cards, 29 library rows).

### Active
- Commit, push to `main`, confirm GitHub Pages deploy, and share all links (including this backup and commit hash).

### Blocked
- None.

## Next Move
- None pending; future maintenance as requested.

## Relevant Files
- `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/icon.svg`
- `works/index.html`, `works/Maktaba/index.html`, `works/sw.js`, `works/Maktaba/sw.js`
- `CONVERSATION-2026-11-19-shubuhat-wa-rudud.md` (this backup)

## Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Backup: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-shubuhat-wa-rudud.md
- Prior backups: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-19-cairo-typography.md , https://github.com/ucfzem/ucfzem.github.io/blob/main/works/CONVERSATION-2026-11-19-works-links.md
- New app: https://ucfzem.github.io/shubuhat-wa-rudud/
- Works: https://ucfzem.github.io/works/ , https://ucfzem.github.io/works/Maktaba/
- Existing: https://ucfzem.github.io/a3lam-al-dawa/ , https://ucfzem.github.io/a3lam-al-3olama/ , https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
