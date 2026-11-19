# Conversation Backup — shubuhat-wa-rudud integration — 2026-11-19

## Objective
- Maintain `a3lam-al-dawa` and `a3lam-al-3olama` in `ucfzem/ucfzem.github.io` (typography/links intact), add/integrate `shubuhat-wa-rudud` (expanded academic study) into `works/index.html` and `works/Maktaba/` additively with a fitting icon, fix mobile header truncation, and enrich it with extensive, academic, searchable/TOC-integrated content: detailed shubuhat with responses (including Al-Shafi‘i’s full munazara from *al-Umm*), comprehensive lists of figures/doubts and scholars/refutations; then verify, commit/push/deploy, save/update this backup, and share all links.

## Important Details
- **Repo/deploy:** `ucfzem/ucfzem.github.io`, branch `main`, GitHub Pages auto-deploys on push. Deploy repo `/tmp/ucfzem-site`. Git push via stored credentials; `GH_TOKEN` absent (no tokens echoed). No force-push/reset/clean; `git status`/`git diff` checked before commits; no unrelated deletions/overwrites.
- **Constraints/directives:** Preserved schema/localization/tags/links/CSS/SW/offline behavior and existing sites/apps. `https://ucfzem.github.io/works/Maktaba` kept safe; all changes additive/targeted. Previous loss of sites by user noted — changes made carefully.
- **`shubuhat-wa-rudud` (implemented):** Folder `shubuhat-wa-rudud/` at repo root with expanded self-contained `index.html` (“شبهات وردود — دراسة علمية نقدية موسّعة”, `lang="ar" dir="rtl"`, inline CSS/JS, Google Fonts Amiri/Aref Ruqaa/Cairo/Scheherazade New, search/TOC/theme/font-size/progress/reading-position, localStorage keys `shubuhat_theme_v1`, `shubuhat_font_v1`, `shubuhat_size_v1`, `shubuhat_last_part_v1`) and fitting `icon.svg` (shield + open book). URL: `https://ucfzem.github.io/shubuhat-wa-rudud/`.
- **Metadata/tags:** AR title `شبهات وردود — ضوابط المنهج الشرعي`, EN title `Shubuhat wa Rudud`, tags/context `العقيدة والمنهج` / `السنة والصحيحين` / `الرد على الشبهات`.
- **`works/index.html`:** Public project #21 (`🛡️`, icon/URL `https://ucfzem.github.io/shubuhat-wa-rudud/`, `newTab: true`) after A3lam al-3olama; dynamic count `publicProjects.length + maktaba.length` (20 + 31 = 51).
- **`works/Maktaba/index.html`:** 6th webapp card (AR/EN “Shubuhat wa Rudud”, tags `العقيدة والمنهج · السنة والصحيحين · الرد على الشبهات`); counts/meta “29 Arabic books & 6 webapps / 6 apps” (library 29 rows).
- **Service workers:** `works/sw.js` `maktaba-v15` → `maktaba-v16`, `works/Maktaba/sw.js` `maktaba-main-v6` → `maktaba-main-v7` (shubuhat icon precached/EXTERNAL).
- **Mobile header fix:** Narrow-screen header no longer truncates brand title: `.site-header` wraps, `.brand-group`/`.brand-titles` flexible with `min-width: 0`, `.header-controls .btn` `flex-shrink: 0`, and on `@media (max-width: 600px)` compact controls with `.brand-title` readable (`0.92rem`, `line-height: 1.25`, `white-space: normal`, no mid-word ellipsis).
- **Academic content (TOC + search integrated):** Study structured into 10 sections with sidebar TOC and active tracking: مقدمة؛ 1) تأصيل المنهج وضوابط التلقي (أدلة، ضوابط مفصلة، فرق العالم الرباني/المتصدر)؛ 2) الإشكالات المنهجية عالميًا (شبهة/نماذج/رد لكل إشكال + خريطة جغرافية موسعة)؛ 3) **الرد التفصيلي على دعاوى التيار القرآني** (آيات، الرد على «تبيانًا لكل شيء/ما فرطنا»، حديث «أوتيت الكتاب ومثله معه» بنصه وتخريجه وتفسير العلماء كالشافعي والخطابي، إجماع/تاريخ، عقل/واقع تشريعي، شبهات فرعية كالتدوين المتأخر والظنية وزعم أن الشافعي أول من قرر الحجية وقصة «حسبنا كتاب الله»)؛ **مناظرة الإمام الشافعي في الرد على منكري السنة** من *الأم* (كتاب جماع العلم، باب حكاية قول الطائفة التي ردت الأخبار كلها) بنصها التفصيلي ومصادرها (إسلام ويب/ويكي مصدر)؛ 4) منزلة الصحيحين والرد التفصيلي على الشبهات (شروط/منهج، تلقي الأمة، الإسناد والجرح والتعديل، شبهات وأجوبة والفرق بين النقد المنضبط والطعن)؛ 5) العلماء الربانيون وجهودهم في الرد (تفصيل بحسب التيارات/الشخصيات)؛ 6) **لائحة أبرز أصحاب الشبهات والمناهج المنحرفة وأشهر شبهاتهم** (بطاقات تفصيلية متعددة الشبهات لعدنان إبراهيم، علي كيالي، محمد الفايد، أحمد عصيد، محمد شحرور، أحمد صبحي منصور، رشاد خليفة، جمال البنا، حسن فرحان المالكي، محمد الطالبي + جدول موسع لأسماء أخرى كبرويز وإديب يوكسل وقاسم أحمد وأركون وأبو زيد وحسن حنفي ومحمود محمد طه وجاويد غامدي… + شبهات متكررة)؛ 7) **لائحة العلماء الأجلاء والباحثين الرادين وأشهر ردودهم** (بطاقات تفصيلية للشافعي وابن باز والعثيمين والفوزان والشعراوي والقرضاوي والحويني ومشهور آل سلمان وربيع المدخلي وعبد الغني عبد الخالق/السباعي/مزروعة/خادم حسين إلهي بخش وغيرهم + جدول موسع كلاسيكي/معاصر + مسارات الرد)؛ 8) التوصيات التطبيقية والخاتمة. Live search (`collectTextNodes`) covers `.prose-body, .data-table td/th, .verse-box, .hadith-box, .audit-mini-title, .audit-mini-text` so names/doubts/responses/texts (including munazara) are searchable and highlighted with counter.
- **Preserved apps:** `a3lam-al-3olama` `https://ucfzem.github.io/a3lam-al-3olama/` and `a3lam-al-dawa` `https://ucfzem.github.io/a3lam-al-dawa/` / worker `https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/` unchanged.
- **Prior context/commits:** `5977d43` works links, `439fce0` works links backup, `4481658` Cairo typography, `73c2540`/`c936445` prior blocked shubuhat backups, `77166d0` initial shubuhat integration, `bd235ab` mobile header truncation fix, `0115096` backup update, `030d545` extensive doubts/responses lists added.
- **Conversation note:** User asked to complete and explain the hadith «ألا إني أوتيت الكتاب ومثله معه…» (Abu Dawud 4604, al-Tirmidhi 2664, Ahmad 4/130–131; authenticated by al-Albani) with Sunni scholarly explanation (e.g. al-Shafi‘i in *al-Risala*, al-Khattabi in *Ma‘alim al-Sunan*, Ibn ‘Abd al-Barr) — answered in chat and incorporated into the study text.

## Work State
### Completed
- Created/integrated `shubuhat-wa-rudud/` into `works/index.html` and `works/Maktaba/index.html` with metadata/tags, counts, SW bumps, and fitting icon (additive). Commit `77166d0`.
- Fixed mobile header brand-title truncation. Commit `bd235ab`.
- Added extensive searchable/TOC-integrated lists of figures/doubts and scholars/responses (parts 6–7) and renumbered conclusion (8). Commit `030d545`.
- Added Al-Shafi‘i’s full munazara (from *al-Umm*, Jamāʿ al-ʿIlm) and enriched all core sections (1–5,3) with detailed shubhat, evidences, and responses in the same rich academic style; integrated into TOC and search. Pending commit/push in this update.
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
