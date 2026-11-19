# Conversation Backup — shubuhat-wa-rudud integration — 2026-11-19

## Objective
- Maintain `a3lam-al-dawa` and `a3lam-al-3olama` in `ucfzem/ucfzem.github.io` (typography/links intact), add/integrate `shubuhat-wa-rudud` (last provided expanded version) into both `works/index.html` and `works/Maktaba/` additively with a fitting icon, fix mobile header truncation, and expand it with extensive, academic lists of figures/doubts and scholars/responses integrated into TOC and search; then verify, commit/push/deploy, save/update this backup, and share all links.

## Important Details
- **Repo/deploy:** `ucfzem/ucfzem.github.io`, branch `main`, GitHub Pages auto-deploys on push. Deploy repo `/tmp/ucfzem-site`. Git push via stored credentials; `GH_TOKEN` absent (no tokens echoed). No force-push/reset/clean; `git status`/`git diff` checked before commits; no unrelated deletions/overwrites.
- **Constraints/directives:** Preserved schema/localization/tags/links/CSS/SW/offline behavior and existing sites/apps. `https://ucfzem.github.io/works/Maktaba` kept safe; all changes additive/targeted.
- **`shubuhat-wa-rudud` (implemented):** Folder `shubuhat-wa-rudud/` at repo root with expanded self-contained `index.html` (“شبهات وردود — دراسة علمية نقدية موسّعة”, `lang="ar" dir="rtl"`, inline CSS/JS, Google Fonts Amiri/Aref Ruqaa/Cairo/Scheherazade New, search/TOC/theme/font-size/progress/reading-position, localStorage keys `shubuhat_theme_v1`, `shubuhat_font_v1`, `shubuhat_size_v1`, `shubuhat_last_part_v1`) and fitting `icon.svg` (shield + open book). URL: `https://ucfzem.github.io/shubuhat-wa-rudud/`.
- **Metadata/tags:** AR title `شبهات وردود — ضوابط المنهج الشرعي`, EN title `Shubuhat wa Rudud`, tags/context `العقيدة والمنهج` / `السنة والصحيحين` / `الرد على الشبهات`.
- **`works/index.html`:** Public project #21 (`🛡️`, icon/URL `https://ucfzem.github.io/shubuhat-wa-rudud/`, `newTab: true`) after A3lam al-3olama; dynamic count `publicProjects.length + maktaba.length` (20 + 31 = 51).
- **`works/Maktaba/index.html`:** 6th webapp card (AR/EN “Shubuhat wa Rudud”, tags `العقيدة والمنهج · السنة والصحيحين · الرد على الشبهات`); counts/meta “29 Arabic books & 6 webapps / 6 apps” (library 29 rows).
- **Service workers:** `works/sw.js` `maktaba-v15` → `maktaba-v16`, `works/Maktaba/sw.js` `maktaba-main-v6` → `maktaba-main-v7` (shubuhat icon precached/EXTERNAL). No `shubuhat-wa-rudud` SW.
- **Mobile header fix:** Narrow-screen header no longer truncates brand title (`شبهات ور...`): `.site-header` wraps, `.brand-group`/`.brand-titles` flexible with `min-width: 0`, `.header-controls .btn` `flex-shrink: 0`, and on `@media (max-width: 600px)` compact controls with `.brand-title` readable (`0.92rem`, `line-height: 1.25`, `white-space: normal`, no mid-word ellipsis).
- **Academic expansion (TOC + search):** Added new structured sections in `shubuhat-wa-rudud/index.html`: **part-6** “لائحة أبرز أصحاب الشبهات والمناهج المنحرفة وأشهر شبهاتهم” (detailed cards for عدنان إبراهيم، علي كيالي، محمد الفايد، أحمد عصيد، محمد شحرور، أحمد صبحي منصور، رشاد خليفة، جمال البنا، حسن فرحان المالكي، محمد الطالبي with multiple doubts each + expanded table including غلام أحمد برويز، إديب يوكسل، قاسم أحمد، محمد أركون، نصر حامد أبو زيد، حسن حنفي، محمود محمد طه، جاويد أحمد غامدي + recurring-doubts summary) and **part-7** “لائحة العلماء الأجلاء والباحثين الرادين على الشبهات وأشهر ردودهم” (detailed cards for الشافعي، ابن باز، العثيمين، الفوزان، الشعراوي، القرضاوي، الحويني، مشهور آل سلمان، ربيع المدخلي، عبد الغني عبد الخالق/السباعي/مزروعة/خادم حسين إلهي بخش وغيرهم + expanded classical/modern table + response-paths summary). Renumbered former recommendations/conclusion to **part-8**. TOC sidebar updated with entries for part-6/7/8 (active tracking via existing `section-card`/`toc-btn` logic). Live search (`collectTextNodes`) expanded to include `.audit-mini-title, .audit-mini-text` so all names/doubts/responses in cards and tables are searchable/highlighted with counter.
- **Preserved apps:** `a3lam-al-3olama` `https://ucfzem.github.io/a3lam-al-3olama/` and `a3lam-al-dawa` `https://ucfzem.github.io/a3lam-al-dawa/` / worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/` unchanged.
- **Prior context/commits:** `5977d43` works links, `439fce0` works links backup, `4481658` Cairo typography, `73c2540`/`c936445` prior blocked shubuhat backups, `77166d0` initial shubuhat integration, `bd235ab` mobile header truncation fix, `0115096` backup update.
- **Conversation note:** User asked to complete and explain the hadith «ألا إني أوتيت الكتاب ومثله معه…» (Abu Dawud 4604, al-Tirmidhi 2664, Ahmad 4/130–131; authenticated by al-Albani) with Sunni scholarly explanation (e.g. al-Shafi‘i in *al-Risala*, al-Khattabi in *Ma‘alim al-Sunan*, Ibn ‘Abd al-Barr) — answered in chat; no repo/site content changed for this.

## Work State
### Completed
- Created/integrated `shubuhat-wa-rudud/` into `works/index.html` and `works/Maktaba/index.html` with metadata/tags, counts, SW bumps, and fitting icon (additive). Commit `77166d0`.
- Fixed mobile header brand-title truncation in `shubuhat-wa-rudud/index.html`. Commit `bd235ab`.
- Added extensive, academic, searchable/TOC-integrated lists of figures with multiple doubts and scholars with multiple responses (part-6/7) and renumbered conclusion (part-8); expanded search coverage. Pending commit/push in this update.
- Backup updated for this state.

### Active
- Commit, push to `main`, confirm GitHub Pages deploy, and share all links.

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
