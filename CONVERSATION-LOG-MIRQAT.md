# سجل المحادثة - مِرقاة / مكتبة التوحيد

التاريخ: 2026-10-30

## ملخص العمل
- إعادة بناء القارئ بمعمارية جديدة: متغيّرات CSS للسمات، ملفات JSON منفصلة، توجيه بالـ hash، وتنظيم بالأبواب، مع PWA (manifest + service worker).
- **البيانات: النصوص الحقيقية (67 موضوعًا) من قاعدة البيانات القديمة** — لا نصوص توضيحية.
- النشر في مجلد جديد `/mirqat-tawhid/` دون المساس بالنسخة القديمة `/mirqat-tawhid.html`.

## البنية المنشورة (ucfzem/ucfzem.github.io، main)
```
mirqat-tawhid/
  index.html
  manifest.webmanifest
  sw.js
  data/
    toc.json        (67 بابًا، مصنّفة: الربوبية/الألوهية)
    kitab.json      (67 نصًا)
    fath.json       (67 شرحًا)
    fatawa.json     (9 فتاوى فريدة بعد إزالة التكرار، مرتبطة بالأبواب)
```
- بطاقة المكتبة في `works/index.html` صارت تشير إلى `/mirqat-tawhid/` (commit 44edf0b).
- رُفع إصدار كاش `works/sw.js` إلى v1.0.25 (commit d4408f2).

## المعالجة المطبّقة على النصوص
- تحويل `@QB@/@QE@` إلى «»، وإزالة علامات `^` و`msNNN`.
- تحويل `PageVxxPyy` إلى `[ص yy]` داخل النص.
- إعادة بناء عنوان كل باب من أول مقطع من نص الكتاب (عنوان البداية + أول جملة).
- إزالة تكرار الفتاوى (145 → 9 فريدة) مع دمج الأبواب المرتبطة.

## التحقق قبل النشر
- JSON صالح لكل الملفات؛ `node --check` ناجح للسكربتات.
- 67 بابًا، 67 كتابًا، 67 شرحًا، 9 فتاوى؛ لا أبواب ناقصة ولا روابط فتوى معطوبة.
- اختبار تشغيل آلي (DOM وهمي): التهيئة والعرض والتنقّل `#/c/5` تعمل.

## روابط مباشرة
- التطبيق الجديد: https://ucfzem.github.io/mirqat-tawhid/
- النسخة القديمة (سليمة): https://ucfzem.github.io/mirqat-tawhid.html
- شجرة الروابط (Maktaba): https://ucfzem.github.io/works/
- الجذر: https://ucfzem.github.io/

## ملاحظات
- كل التغييرات إضافية/تعديلات محدّدة؛ لم يُحذف أي ملف (سيُتحقق من عدد الملفات بعد النشر).
- تم النشر عبر GitHub Contents REST API (git clone/fetch/push محجوب على الشبكة).

## 2026-10-30 — نشر نسخة المستخدم النهائية (tawhid-reader.zip)
- استُلمت الحزمة عبر Droppy: https://ucfzem.github.io/droppy/get.html?id=be920919 (الملف `tawhid-reader.zip`).
- محتوى الحزمة: `index.html` (28,694 B، يتضمن «مقدمة الشارح»)، `manifest.webmanifest`، `sw.js` (كاش `tawhid-v1`)، `data/toc.json` (67 بابًا حقيقيًا، تصنيف فارغ)، وملفات `data/kitab|fath|fatawa` فارغة (عناصر نائبة)، مع `README.md` و`tools/import_txt.py` و`tools/fetch_shamela.py`.
- نُشرت الحزمة إلى `/mirqat-tawhid/` مع **الإبقاء على النصوص الحقيقية المستوردة** (kitab 165,297 B، fath 30,804 B، fatawa 42,899 B) بدل الملفات الفارغة، حتى لا تصبح المكتبة فارغة.
- commits: `index.html` cbf0816، `manifest` 37fe0c5، `sw.js` 9241c17، `toc.json` ef79345، `README` b6acbad، `import_txt.py` 3615bec، `fetch_shamela.py` e5ef700.
- بطاقة Maktaba والأيقونة موجودتان مسبقًا وتشيران إلى `/mirqat-tawhid/` (لم يُغيّرا).
- لم تُحذف أي ملفات؛ النصوص الحقيقية محفوظة في تاريخ git وفي نسخة محلية `/tmp/backup_realdata`.

## 2026-10-30 — نشر الحزمة المحدّثة (tawhid-reader-1.zip) + أداة find_passages
- الحزمة الجديدة عبر Droppy: https://ucfzem.github.io/droppy/get.html?id=378049f0 (الملف `tawhid-reader-1.zip`).
- الفرق الوحيد عن النسخة المنشورة: إضافة `tools/find_passages.py` (5,522 B؛ نُشر بعد إصلاح بسيط لاستخراج الجزء/الصفحة من عنوان الصفحة `جN - صN` → 5,748 B).
- بقيت ملفات التطبيق والبيانات كما هي (تخطّي تلقائي للملفات المتطابقة)؛ **لم يُحذف أي ملف**.
- commit: `mirqat-tawhid/tools/find_passages.py` 43b7d31.
- بدأ تشغيل البحث: الصفحات 3–300 (298 صفحة مخزّنة) → 18 صفحة مرشحة في `passages_report.txt` و`data/fatawa_candidates.json` (verified=false). بقية النطاق 301–910 قيد الإكمال.

## 2026-10-30 — اكتمال بحث المجموع (ids 3–910)
- شُغّلت `tools/find_passages.py` على 908 صفحة (المعرّفات 3–910، تشمل الجزأين 1 و2 كاملين).
- النتيجة: 81 صفحة مرشحة؛ 21 منها تجمع «الربوبية» و«الألوهية» معًا. الملفات: `passages_report.txt` و`data/fatawa_candidates.json` (verified=false، لا يحمّلها التطبيق).
- المعرّفات المختارة المقترحة (تشرح الفرق صراحة): 24، 26، 76، 91، 93 (م1)؛ 419، 420، 815، 831، 841 (م2). مساندة: 44، 90، 122 (م1).
- النصوص الكاملة محفوظة محليًا في `/root/tawhid_search/`؛ لم تُنشر في المستودع احترامًا لقاعدة «لا نص كتب في المستودع».

## 2026-10-30 — اختيار المقاطع العشرة (جاهزة للصق)
- اختيرت 10 مقاطع تشرح الفرق بين توحيد الربوبية وتوحيد الألوهية: `mf-1-022`, `mf-1-024`, `mf-1-074`, `mf-1-089`, `mf-1-091`, `mf-2-037`, `mf-2-038`, `mf-2-433`, `mf-2-449`, `mf-2-459`.
- النص الحرفي الكامل محفوظ محليًا في `/root/tawhid_search/selected_fatawa.json` (3,142 حرفًا)؛ لم يُضف إلى `fatawa.json` ولم يُنشر في المستودع (التزامًا بقاعدة «لا نص كتب في المستودع»).
- حالة النشر: آخر نسخة (`tawhid-reader-1.zip`) منشورة في `/mirqat-tawhid/` بما فيها `tools/find_passages.py`؛ لم يُحذف أي ملف (1646 blob).

## 2026-10-30 — إدراج المقاطع العشرة في fatawa.json
- أُضيفت 10 مدخلات (`mf-1-022`, `mf-1-024`, `mf-1-074`, `mf-1-089`, `mf-1-091`, `mf-2-037`, `mf-2-038`, `mf-2-433`, `mf-2-449`, `mf-2-459`) إلى `mirqat-tawhid/data/fatawa.json` بحقل `related: []` (الربط بالأبواب لاحقًا). صار العدد **19** مدخلًا (9 القديمة + 10).
- النصوص مقاطع حرفية من صفحات الشاملة 7289 (المجلدان 1 و2)، مع رقم الجزء والصفحة.
- رُفع كاش `sw.js` إلى `tawhid-v2`. commits: `fatawa.json` 4a94985، `sw.js` 1a1c1c5.

## 2026-10-30 — ربط المقاطع العشرة بالأبواب
- طُبِّق حقل `related` على 10 مدخلات: `mf-1-022` [6,2]، `mf-1-024` [6,1]، `mf-1-074` [14,6,33]، `mf-1-089` [6,14,31,33]، `mf-1-091` [4,6,14,31]، `mf-2-037` [6,1]، `mf-2-038` [6,4,31]، `mf-2-433` [6,1]، `mf-2-449` [6,42,67]، `mf-2-459` [6,2,3].
- رُفع كاش `sw.js` إلى `tawhid-v3`. commits: `fatawa.json` 06630ec، `sw.js` bb2a6d8.

## 2026-10-30 — تشغيل offline كامل + نسخة احتياطية من works
- `mirqat-tawhid/sw.js`: كاش `tawhid-v4` يخزّن الهيكل + Tailwind CDN + Google Fonts (CSS وwoff2) + البيانات؛ فتح online/offline. commit a8e9abb.
- `mirqat-tawhid/manifest.webmanifest`: أيقونة حقيقية `icon.svg` (88749d6)، وأُضيف `mirqat-tawhid/icon.svg` (c38576b).
- `works/sw.js`: أُضيفت 3 أيقونات كانت ناقصة من الكاش (`al-a3chab-attebiah`، `izhar-al-haqq`، `tafsir-ibn-taymiyyah`) ورُفع الكاش إلى `works-v1.0.26` (7bdca72).
- نسخة احتياطية من works: محليًا `/root/backup_works_2026-10-30` (35 ملفًا، ~2MB) وفي المستودع `_backups/works-2026-10-30/` (index.html 8cea237، sw.js 67c9632، fonts.css 4dab2d5، MANIFEST.txt 90ae620). تحقق: كل 29 رابط أيقونة = 200.

## 2026-10-30 — تشغيل offline كامل + نسخة احتياطية من works
- `mirqat-tawhid/sw.js`: كاش `tawhid-v4` يخزّن الهيكل + Tailwind CDN + Google Fonts (CSS وwoff2) + البيانات؛ فتح online/offline. commit a8e9abb.
- `mirqat-tawhid/manifest.webmanifest`: أيقونة حقيقية `icon.svg` (88749d6)، وأُضيف `mirqat-tawhid/icon.svg` (c38576b).
- `works/sw.js`: أُضيفت 3 أيقونات كانت ناقصة من الكاش (`al-a3chab-attebiah`، `izhar-al-haqq`، `tafsir-ibn-taymiyyah`) ورُفع الكاش إلى `works-v1.0.26` (7bdca72).
- نسخة احتياطية من works: محليًا `/root/backup_works_2026-10-30` (35 ملفًا، ~2MB) وفي المستودع `_backups/works-2026-10-30/` (index.html 8cea237، sw.js 67c9632، fonts.css 4dab2d5، MANIFEST.txt 90ae620). تحقق: كل 29 رابط أيقونة = 200.
- تحقق نهائي: build `f31a700` = built؛ **1651 blob**؛ لا حذف. كل روابط الأيقونات (29) = 200. التطبيق 28,694 B، `sw.js` 3,387 B، `manifest` 484 B، `icon.svg` 797 B.
- `works/index.html`: اسم بطاقة التطبيق صار «مكتبة التوحيد» بدل «مِرقاة التوحيد» (الرابط نفسه).

## 2026-10-30 — الاعتماد النهائي: «مكتبة التوحيد»
- النسخة المعتمدة: https://ucfzem.github.io/mirqat-tawhid/ — العنوان «مكتبة التوحيد». النسخة القديمة `mirqat-tawhid.html` مجمّدة وغير مستخدمة.
- بطاقة works: الاسم صار «مكتبة التوحيد» والرابط نفسه `/mirqat-tawhid/` (commit e8a4851).
- offline: `tawhid-v4` يخزّن الهيكل + البيانات + Tailwind + خطوط Google (CSS/woff2)؛ manifest بأيقونة `icon.svg`.
- نسخة works: محليًا `/root/backup_works_2026-10-30` (35 ملفًا) + `_backups/works-2026-10-30/` (لقطة قبل إعادة التسمية، مع MANIFEST وSHA-256).
- فحص نهائي: كل الملفات الأساسية 200؛ 19 فتوى؛ 29 أيقونة 200؛ **1651 blob؛ لا حذف**. آخر بناء موثّق قبل هذا السطر: `8cc6c37` = built؛ ثم أُعيد البناء لنشر هذا السجل.
- روابط: التطبيق https://ucfzem.github.io/mirqat-tawhid/ · works https://ucfzem.github.io/works/ · نسخة works https://ucfzem.github.io/_backups/works-2026-10-30/ · السجل https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-LOG-MIRQAT.md

## 2026-10-30 — إصلاح صور «المعشبة المغربية» + PWA
- الموقع الحي يُخدَم من المستودع `ucfzem/al-a3chab-attebiah` (وليس من مجلد `al-a3chab-attebiah/` في مستودع الموقع). لم يُحذف أي ملف.
- `app.js` v1.3.9: كل صورة تُحمَّل من `imageSource` الأصلي على ويكيميديا كومنز عبر `Special:FilePath?width=640` (149/151 مدخلاً)؛ عند الفشل: بحث لاتيني مخفّف ثم `icon.svg`. أُصلح `src="./data:image…"` المعطوب.
- `index.html`: تحميل `wiki-images.js` ورفع الإصدار إلى 1.3.9.
- `manifest.json` (872 B) وأيقونتان PNG حقيقيتان (192/512) بدل ملفات 404 (14 B).
- `sw.js`: كاش `a3chab-v1.3.9` يعمل دون اتصال (بدل SW كان يلغي نفسه).
- تحقق: كل الملفات 200؛ الأيقونات PNG صحيحة؛ 149 رابط كومنز = 200؛ **30 blob؛ لا حذف**. build `d058051` = built.
- روابط: https://ucfzem.github.io/al-a3chab-attebiah/ · https://ucfzem.github.io/al-a3chab-attebiah/manifest.json · https://ucfzem.github.io/al-a3chab-attebiah/sw.js

## 2026-10-31 — «المعشبة المغربية» تعمل دون اتصال بكل الصور
- أُنشئ `image-manifest.json` (141 صورة فريدة لـ149 مدخلاً، ~34 MB) بروابط ويكيميديا كومنز المباشرة (`thumb.wikimedia.org`/`upload.wikimedia.org`).
- `app.js` v1.4.0: تحميل تلقائي لكل الصور إلى `Cache Storage` (`a3chab-images-v1`) مع شريط تقدم، إيقاف/متابعة، إعادة محاولة، وتخزين الحالة في `localStorage`.
- `sw.js` v1.4.0: كاش صور مستقل، تقديم الصور من الكاش أولاً، وتخزين CSS+woff2 لخطوط Google؛ تنظيف آمن يقتصر على `a3chab-*` (لا يمس `tawhid-*` أو `works-*`).
- تحقق فعلي بمتصفح Chromium: 141/141 صورة في الكاش؛ بعد قطع الشبكة وإعادة التحميل: 151/151 صورة ظاهرة، وصورة البطاقة 960×720، ولا أخطاء شبكة.
- المستودع: 31 blob (إضافة `image-manifest.json` فقط؛ **لا حذف**). build `0ff5276` = built.
- روابط: https://ucfzem.github.io/al-a3chab-attebiah/ · https://ucfzem.github.io/al-a3chab-attebiah/image-manifest.json · https://ucfzem.github.io/al-a3chab-attebiah/sw.js

## 2026-10-31 — أيقونة جديدة لـ«المعشبة المغربية» مع الحفاظ على العمل دون اتصال
- استُبدل `icon.svg` بصورة نباتية 512×512 (JPEG مضمّن base64) من ملف Droppy `6e87a88a`.
- رُفع كاش القشرة إلى `a3chab-v1.4.1` لتظهر الأيقونة الجديدة فوراً؛ كاش الصور `a3chab-images-v1` (141) بقي سليماً.
- تحقق فعلي: 141/141 صورة + الأيقونة في الكاش؛ بعد قطع الشبكة: 151/151 صورة، الأيقونة 512×512، صورة البطاقة 960×720، ولا أخطاء.
- اختبار ترقية SW من v1.4.0 إلى v1.4.1: حُذفت قشرة v1.4.0 فقط، وبقيت `a3chab-images-v1` ومدخلها التجريبي.
- المستودع: 31 blob (استبدال `icon.svg` و`sw.js` فقط؛ **لا حذف**). build `6f8de38` = built.
- ملاحظة: أيقونتا PNG (192/512) بقيتا على التصميم القديم؛ يمكن تحديثهما عند الطلب.
- روابط: https://ucfzem.github.io/al-a3chab-attebiah/ · https://ucfzem.github.io/al-a3chab-attebiah/icon.svg

## 2026-10-31 — إصلاح صورة «مقدمة الطبعة الكاملة — 150 نوعاً» على الهواتف الصغيرة
- كانت المقدمة تستخدم `icon.svg` (144 KB، SVG يحتوي JPEG مضمّناً) فتفشل على هواتف قديمة مثل Samsung A5.
- أُنشئ `intro.jpg` (512×512، 108 KB) من نفس الصورة، ويُستخدم الآن للمقدمة وللمداخل بلا صورة (مثل الزعتر الفاسي).
- أُزيلت نسبة «ويكيميديا كومنز» الوهمية من بطاقة المقدمة؛ تُعرض فقط عند وجود `imageSource`.
- `sw.js` v1.4.2: يخزّن `intro.jpg` في القشرة؛ كاش الصور `a3chab-images-v1` محفوظ.
- تحقق فعلي بهاتف 360×640 وUA لـSamsung A5: صورة المقدمة 512×512 في الفهرس والقارئ، ثم بعد قطع الشبكة 151/151 صورة، ولا أخطاء. كاش الصور 142 (141 من البيان + صورة احتياطية).
- المستودع: 32 blob (إضافة `intro.jpg`؛ **لا حذف**). build `fcb36a2` = built.
- روابط: https://ucfzem.github.io/al-a3chab-attebiah/ · https://ucfzem.github.io/al-a3chab-attebiah/intro.jpg

---

## 2026-10-31 — Basa'ir reader deployment

### Basa'ir reader (new)
- **Live app:** https://ucfzem.github.io/basair/
- **Repository path:** `basair/`
- **Files:** 16 total — `index.html`, `sw.js`, `manifest.json`, `icon.svg`, `icon-192.png`, `icon-512.png`, 8 self-hosted WOFF2 fonts (Amiri + Tajawal), and 2 OFL license files.
- **Blob audit:** 1,663 → 1,679 (+16). No deletions; existing sites untouched.
- **Commit:** `7512782` — Add Basa'ir reader app under `/basair/`.
- **Features:** Arabic RTL reader, dark/light themes, 5 chapters / 14 sections, hierarchical TOC, live search with Arabic normalization (diacritics, ta marbuta, alef variants), result count, highlighted matches, next/previous result, 4 interface languages (Arabic, English, French, Spanish), font-size control (15–28 px), progress bar, back-to-top, scroll resume, and offline PWA support.
- **Offline/PWA:** service worker cache `basair-v1.0.1`; manifest with 192/512 icons; all fonts bundled locally. Scope: `/basair/`.
- **Tests:** local and live Playwright checks passed for search/normalization, result navigation, TOC, themes, languages, font persistence, mobile drawer, progress, resume, service-worker activation, and offline reload. No external requests; no console errors.
- **Quick links:** [app](https://ucfzem.github.io/basair/) · [manifest](https://ucfzem.github.io/basair/manifest.json) · [service worker](https://ucfzem.github.io/basair/sw.js) · [icon](https://ucfzem.github.io/basair/icon.svg)

### Works backup (previous task, still live)
- **Backup:** https://ucfzem.github.io/works/al-a3chab-attebiah/
- **Original:** https://ucfzem.github.io/al-a3chab-attebiah/
- 12 backup files; user-site blobs 1,651 → 1,663; live al-a3chab repository stayed at 32 blobs.
- `works/sw.js` → `works-v1.0.27` with backup-path skip; root `sw.js` skip added.
- Live and backup SW → v1.4.3 with scoped `a3chab-images-v1` lookup, fixing the opaque-image CORS failure.
- Page, service worker, manifest, and icons verified live. Note: the automated 141-image preload test still shows an intermittent works-first SW race; no data was lost.


---

## 2026-10-31 — Basa'ir: Nuzhat redesign, multilingual flags, Maktaba card

### Basa'ir app — final version
- **Live app:** https://ucfzem.github.io/basair/
- **Redesign commits:** `a25a250` (Nuzhat-style theme) → `d1f640d` (language flags + new icon). Final app commit: `d1f640d`.
- **Files:** 19 total — app shell, manifest, SW, 3 icons, 10 self-hosted WOFF2 fonts (Amiri + Cairo), 3 OFL license files. Blob audit **1,682**; **no deletions**.
- **Theme:** warm manuscript palette — dark `#121110` / `#1c1917` / `#231f1c`, gold `#c29b53` / `#d4af37`, emerald `#2d5d46` / `#1b4332`; light `#fbf8f2` / `#fffdf6` / `#f5f0eb`.
- **Typography:** Cairo for UI, Amiri for the book; default reading size **1.35rem (22px)**, line-height **2.2**, justified Arabic; emerald chapter banners with gold borders; gold section rules; gold drawer border; amber search highlights; gold/emerald progress bar; discreet footer dots.
- **Languages:** custom menu with **AR 🇲🇦 (Morocco)**, **EN 🇬🇧**, **FR 🇫🇷**, **ES 🇪🇸**; SVG flags + initials, endonyms, keyboard navigation, selected state, persistence. All four UI languages remain complete.
- **Icon:** new emerald/gold open-book icon with Moroccan eight-point star; `icon.svg`, `icon-192.png`, `icon-512.png`.
- **PWA/offline:** SW cache `basair-v1.0.3`; local Cairo + Amiri fonts; manifest and icons cached; offline reload verified.
- **Tests:** local + live Playwright passed — 5 chapters, 14 sections, 19 TOC links, 9 search results, language switching/persistence, font controls, themes, mobile drawer, progress, resume, SW activation, offline reload; 0 console/page errors.

### Works link tree
- **Works page:** https://ucfzem.github.io/works/
- **Placement:** Basa'ir is the **first card in the Maktaba folder**, inside the public/unlocked section; name «كتاب بصائر», tag `Basa'ir`, link to the live app, opens in a new tab. No duplicate card.
- **Works commit:** `7a0fd96`; `works/sw.js` → `works-v1.0.29`; Basa'ir icon cache-busted with `?v=2026-10-31-3`.
- **Works test:** 29 Maktaba cards; first card correct; new icon loaded; offline reload shows 29 cards; 0 page errors.
- **Blob audit:** **1,682**; **no deletions**; existing cards, routes and sites untouched.

### Note
- The full text of the copyrighted book was **not** injected. The app retains its current demo/sample content; integrating the complete book requires user-provided or licensed text/permission.
- **Links:** [app](https://ucfzem.github.io/basair/) · [works](https://ucfzem.github.io/works/) · [log](https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-LOG-MIRQAT.md)

---

## 2026-11-01 — Basa'ir: تفعيل ترجمة المحتوى (AR/EN/FR/ES) + تحسين الطباعة اللاتينية

### المشكلة التي كانت على النسخة الحيّة
- النسخة المنشورة كانت لا تزال تستخدم `const BOOK = [...]` ببيانات عربية فقط، بينما مبدّل اللغة يغيّر نصوص الواجهة `I18N` فقط ولا يعيد رسم المحتوى.
- كاش الخدمة كان `basair-v1.0.3`، وملف المحتوى لم يكن يحوي أي مفاتيح `en` / `fr` / `es` للمحتوى.

### ما تم تنفيذه
- إضافة `basair/content-i18n.js` (44,942 B) يحتوي ترجمات EN/FR/ES للفصول الخمسة والمقاطع الأربعة عشر في العرض التجريبي، دون أي نص من الكتاب المحمي.
- إضافة `mergeBookTranslations()` في `index.html`: تحويل `title` و`intro` و`paragraphs` إلى كائنات `{ar,en,fr,es}` مع الرجوع إلى العربية عند غياب ترجمة.
- تحديث `localized(field)` ليتعامل مع النص المباشر والكائن متعدد اللغات والمصفوفات، مع الرجوع إلى `ar` ثم أول قيمة متاحة.
- تحديث `renderBook()` و`updateActive()` و`applyLanguage()` لاستخدام `localized()` وإعادة رسم المحتوى عند تغيير اللغة، مع ضبط `bookEl.dir` والحفاظ على موضع التمرير وإعادة تنفيذ البحث الحالي.
- إضافة `data-i18n="appTitle"` إلى العنوان، وتحسين CSS للاتينية: `Cairo`، `line-height: 1.85`، `text-align: left`، `text-align-last: auto`، مع إبقاء العربية `Amiri`/`justify` و`line-height: 2.1`.
- رفع كاش `basair/sw.js` إلى `basair-v1.0.5` وإضافة `./content-i18n.js` إلى `CORE`.

### التحقق
- اختبار DOM محلي وحيّ: **5 فصول، 14 مقطعًا، 19 رابط فهرس**، التبديل AR/EN/FR/ES، البحث بالعربية والإنجليزية والفرنسية والإسبانية، **0 أخطاء JS**.
- الصفحة الحيّة تحتوي `content-i18n.js` و`line-height: 1.85`؛ `sw.js` الحيّ يعرض `basair-v1.0.5` مع `?cb=`.
- كل الروابط الأساسية ترجع **200**: التطبيق، manifest، sw، content-i18n، works، السجل، الجذر.
- بطاقة «كتاب بصائر» ما زالت أول بطاقة في Maktaba على `works/`.

### الحالة والسلامة
- commits: `a01cd5a` (الترجمات + كاش v1.0.4) ثم `c0016fc` (تحسين الطباعة + كاش v1.0.5).
- blob audit: **1,682 → 1,683** (إضافة `content-i18n.js` فقط)؛ **لا حذف** ولا تعديل على مواقع أخرى.
- لم يُستخدم أي نص من `ar-basaar` المحمي. الترجمة تخص محتوى العرض التجريبي فقط.
- سكربت `build-data.js` جُرّب على ملف تجريبي اصطناعي فقط؛ لم يُنشر ولم يُشغّل على الكتاب المحمي.
- ملاحظة CDN: قد يعرض GitHub Pages نسخة قديمة من `sw.js` دون `?cb=` لبعض الوقت؛ القيمة الحالية هي `basair-v1.0.5`.

### روابط مباشرة
- التطبيق: https://ucfzem.github.io/basair/
- المحتوى متعدد اللغات: https://ucfzem.github.io/basair/content-i18n.js
- Service Worker: https://ucfzem.github.io/basair/sw.js
- Manifest: https://ucfzem.github.io/basair/manifest.json
- Maktaba: https://ucfzem.github.io/works/
- السجل: https://ucfzem.github.io/CONVERSATION-LOG-MIRQAT.md
- الجذر: https://ucfzem.github.io/
