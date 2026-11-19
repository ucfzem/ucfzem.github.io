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
- **Mobile header fix (shubuhat-wa-rudud):** Prevented brand title truncation (`شبهات ور...`) on narrow portrait screens by making `.site-header` wrap cleanly, giving `.brand-group`/`.brand-titles` flexible min-width (`flex: 1 1 auto; min-width: 0`), keeping `.header-controls .btn` `flex-shrink: 0`, and on `@media (max-width: 600px)` using compact controls (`min-height: 36px; padding: 0.32rem 0.55rem; font-size: 0.78rem; gap: 0.35rem`) with `.brand-title` readable without mid-word ellipsis (`font-size: 0.92rem; line-height: 1.25; white-space: normal; overflow: visible; text-overflow: clip`), subtitle hidden, while preserving theme/RTL/layout/functionality.
- **Preserved apps:** `a3lam-al-3olama` live `https://ucfzem.github.io/a3lam-al-3olama/` and `a3lam-al-dawa` live `https://ucfzem.github.io/a3lam-al-dawa/` / worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/` unchanged.
- **Prior context/commits:** `5977d43` works links, `439fce0` works links backup, `4481658` Cairo typography, `73c2540`/`c936445` prior blocked/pending shubuhat backups, `77166d0` initial shubuhat integration, `bd235ab` mobile header truncation fix.
- **Conversation note:** User asked to complete and explain the hadith «ألا إني أوتيت الكتاب ومثله معه…» (Abu Dawud 4604, al-Tirmidhi 2664, Ahmad 4/130–131; authenticated by al-Albani) with Sunni scholarly explanation (e.g. al-Shafi‘i in *al-Risala*, al-Khattabi in *Ma‘alim al-Sunan*, Ibn ‘Abd al-Barr) — answered in chat; no repo/site content changed for this.

## Work State
### Completed
- Created/integrated `shubuhat-wa-rudud/` into `works/index.html` and `works/Maktaba/index.html` with metadata/tags, counts, SW bumps, and fitting icon (additive; no unrelated changes). Commit `77166d0`.
- Fixed mobile header brand-title truncation in `shubuhat-wa-rudud/index.html` (targeted responsive/header CSS). Commit `bd235ab`.
- Backup updated/pushed with latest state.

### Active
- None (deployed on `main`, GitHub Pages auto-deploying).

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
