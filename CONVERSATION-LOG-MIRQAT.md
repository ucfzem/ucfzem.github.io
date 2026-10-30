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
