# Session — 2026-10-11 — Tarikh Ibn Khaldun (تاريخ ابن خلدون)

## Objectif
Construire un nouveau webapp hors-ligne **تاريخ ابن خلدون / ديوان المبتدأ والخبر**
dans le même style que `al-adhkiya` / `mujam-al-buldan`, puis le déployer sur
GitHub Pages et l'ajouter au link tree public (`works`).

## Nouveau projet : `ucfzem/tarikh-ibn-khaldun`

- **URL live :** https://ucfzem.github.io/tarikh-ibn-khaldun/
- **Dépôt :** https://github.com/ucfzem/tarikh-ibn-khaldun
- **Source du texte :** OpenITI, branche `0825AH`, copie `Shamela_0012320`
  (تحقيق خليل شحادة، دار الفكر بيروت، ط2 1408هـ/1988م)، ملف
  `0808IbnKhaldun.Tarikh.Shamela0012320-ara1.mARkdown` (14.1 MB).
- **النص المفكك:** 5 أجزاء · 21 كتابًا/بابًا · 284 فصلًا · 2674 خبرًا ·
  **113,154** فقرة (7.34M chars). `book-data.js` = 16.2 MB.
- **التطبيق:** صفحة واحدة مستقلة بلا CDN: فهرس شجري متعدد المستويات، بحث فوري
  في النص كاملًا مع تطبيع عربي (إزالة التشكيل/توحيد الهمزات) وإبراز، أوضاع
  (نهاري/ورقي/ليلي)، خط (أميري/كايرو) وحجم، حفظ الموضع (localStorage)،
  PWA (`manifest.json` + `sw.js`) وخطوط محلية (woff2).
- **بنية المستودع:** الموقع في جذر المستودع (`index.html`, `book-data.js`,
  `fonts/`, `icon.svg`, `sw.js`, `manifest.json`) + `scripts/parse.mjs` +
  `data/*.mARkdown`. الفرعان `main` و`gh-pages` على نفس الالتزام.
- **النشر:** GitHub Pages من `gh-pages` (المسار `/`)، الحالة `built`، HTTP 200.

### Commit
- `ba0520f` — Initial release: Tarikh Ibn Khaldun offline reader.

## تعديل link tree (`ucfzem.github.io/works/index.html`)

- **الموضع 10** (وسط القائمة العامة، داخل مجموعة الكتب بعد الأذكياء):
  ```js
  { num: 10, emoji: "📜", name: "Tarikh Ibn Khaldun", tag: "History",
    icon: "https://ucfzem.github.io/works/assets/tarikh-ibn-khaldun.svg",
    url: "https://ucfzem.github.io/tarikh-ibn-khaldun/", newTab: true },
  ```
- إعادة ترقيم المشاريع 10→19.
- العدد: «18» → «**19 projets publics**».
- `ItemList` JSON-LD: موضع 10 جديد، وإزاحة 10→22.
- `<meta name="description">`: إضافة «Tarikh Ibn Khaldun».
- أيقونة جديدة: `works/assets/tarikh-ibn-khaldun.svg`.

### Commit
- `204f697` (works) — *works: add Tarikh Ibn Khaldun (تاريخ ابن خلدون) to public
  projects at position 10 (middle) + icon + JSON-LD/meta*.

## التحققات قبل/بعد النشر
- `git diff` لـ works: **ملف واحد فقط** `works/index.html` + ملف أيقونة جديد؛
  لا حذف لأي مشروع قائم، ولا إعادة كتابة تاريخ.
- JSON-LD: `JSON.parse` سليم، 22 عنصرًا، المواضع فريدة 1..22.
- `publicProjects`: 19 عنصرًا، الأرقام فريدة 1..19، لا فقدان لأي اسم سابق.
- بعد النشر: الصفحة الحية 200، «Tarikh Ibn Khaldun» ظاهر، «19 projets publics»،
  وأيقونة `.../assets/tarikh-ibn-khaldun.svg` = 200.

## الروابط
- التطبيق: https://ucfzem.github.io/tarikh-ibn-khaldun/
- المستودع: https://github.com/ucfzem/tarikh-ibn-khaldun
- link tree: https://ucfzem.github.io/works/
- الأيقونة: https://ucfzem.github.io/works/assets/tarikh-ibn-khaldun.svg

## ملاحظات
- تم الحفاظ على كل المشاريع السابقة (18) دون أي خسارة؛ الإضافة كانت جراحية
  في ملف واحد عبر fast-forward فقط.

## Update 2026-10-11 (cont.) - Match Al-Adhkiya style + fixes
- Fixed JS: removed missing themeToggle reference; corrected active row selector in tree.
- Reskinned to Al-Adhkiya style: green header with title/subtitle + theme toggle; main#content layout; footer; CSS variables aligned.
- Mobile drawer hardened (z-index, right:-100%→0), overflow-x hidden, sticky offsets adjusted.
- Deployed v1.0.6 (main + gh-pages); SW v1.0.6 with network-first navigations.

Links:
- https://ucfzem.github.io/tarikh-ibn-khaldun/
- https://github.com/ucfzem/tarikh-ibn-khaldun
- https://ucfzem.github.io/works/

## Update 2026-10-11 (final) - Al-Adhkiya UI + lazy scaffold + SW
- Reskinned to match al-adhkiya (header, theme toggle, main#content, footer).
- Fixed JS selectors; added SW registration; prepared manifest/chunks scaffold.
- Deployed v1.0.8 (main+gh-pages). 

Links:
- https://ucfzem.github.io/tarikh-ibn-khaldun/ (Al-Adhkiya style UI, v1.0.8)
- https://github.com/ucfzem/tarikh-ibn-khaldun

## Update 2026-10-11 - Header widened to full width
- Made green header bar full width (removed max-w-7xl), subtitle fits properly.


## Update 2026-10-11 - Header subtitle extended
- Updated header subtitle to include "من ذوي السلطان الأكبر"; header kept full width.


## Update 2026-10-11 - Index scroll buttons + numbering
- Added ▲ أعلى / ▼ أسفل in index sidebar to jump to top/bottom quickly.
- Numbered chapter titles in index (e.g., "1. ...").


## Update 2026-10-11 - Search highlighting
- Added green highlight for matched search terms in content.

