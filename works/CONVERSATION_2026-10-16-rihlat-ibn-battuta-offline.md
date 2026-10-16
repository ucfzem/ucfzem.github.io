# 💬 نسخة محادثة — التحقق من «رحلة ابن بطوطة» في مكتبة works (أونلاين/أوفلاين)

**التاريخ:** 2026-10-16 · **التغييرات في:** `ucfzem.github.io` (المجلد `works/`)
**التطبيق:** https://ucfzem.github.io/rihlat-ibn-battuta/ · **المكتبة:** https://ucfzem.github.io/works/

---

## الطلب
التأكد من أن «رحلة ابن بطوطة» مُدرجة في **المكتبة** (works) داخل مجلد
**Maktaba · المكتبة** ضمن القسم **غير المقفل** (unlocked / #publicProjects)، مع أيقونة
مناسبة، ثم التأكد من أنها تعمل **أونلاين وأوفلاين** — بما في ذلك **كل الأيقونات** في
الوضع دون اتصال — وإضافة **نسخة احتياطية (backup)** لهذه المحادثة إلى مستودع `works`.

---

## الوضع قبل التغيير (مُتحقَّق منه)
البطاقة **موجودة مسبقاً** في مصفوفة `maktaba` داخل `works/index.html`:

```js
{ emoji: "🐪", name: "رحلة ابن بطوطة", tag: "Travel",
  icon: "https://ucfzem.github.io/rihlat-ibn-battuta/icon.svg",
  url:  "https://ucfzem.github.io/rihlat-ibn-battuta/", newTab: true }
```

- تُعرَض داخل مجلد `#f-maktaba` المشيّد في `renderPublic()` ضمن `#publicProjects`
  (القسم العام/غير المقفل، بلا صنف `locked`).
- الأيقونة في `works/sw.js` ضمن `CORE`:
  `rihlat-ibn-battuta/icon.svg` و`rihlat-ibn-battuta/icon-192.png`
  (مع رفع ذاكرة التخزين `works-v1.0.12 → works-v1.0.13`).

**لم يُحذف أو يُعدَّل أي ملف قائم** — العمل هذا **إضافي فقط** (backup md).

---

## التحقق المباشر (أونلاين)
جميع الموارد تعيد **200**:

| المورد | الحالة |
|---|---|
| `/rihlat-ibn-battuta/` | 200 |
| `/rihlat-ibn-battuta/index.html` | 200 |
| `/rihlat-ibn-battuta/app.js` | 200 |
| `/rihlat-ibn-battuta/style.css` | 200 |
| `/rihlat-ibn-battuta/manifest.json` | 200 |
| `/rihlat-ibn-battuta/sw.js` | 200 |
| `/rihlat-ibn-battuta/icon.svg` | 200 |
| `/rihlat-ibn-battuta/icon-192.png` | 200 |
| `/rihlat-ibn-battuta/data/chapters.json` | 200 (١٫٧٦ ميغابايت، ٧٤ باباً) |

---

## التحقق المباشر (أوفلاين) — المتصفح الحقيقي
اختبار Playwright حي: **13/13** ✅
- ظهور البطاقة بالاسم «رحلة ابن بطوطة» والأيقونة المحمّلة فعلاً (512) والرابط الصحيح وغير مقفل.
- التطبيق: الفهرس ٧٤ باباً، البحث الشامل عن «طنجة» ٦ نتائج، النتائج ملوّنة بالأخضر، صفر أخطاء JS.
- **works دون اتصال: 22/22 أيقونة** ✅
- **أيقونة رحلة ابن بطوطة دون اتصال: 1/1** ✅
- لا أخطاء JS في works.

اختبار محلي للتطبيق: **29/29** ✅ · اختبار التطبيق دون اتصال: **11/11** ✅

كل أيقونات مجلد **Maktaba** مُدرجة في `works/sw.js → CORE` ومؤكَّد تحميلها أوفلاين.

---

## الروابط
- التطبيق: https://ucfzem.github.io/rihlat-ibn-battuta/
- المكتبة: https://ucfzem.github.io/works/
- مستودع التطبيق: https://github.com/ucfzem/rihlat-ibn-battuta
- مستودع الجذر: https://github.com/ucfzem/ucfzem.github.io

> النسخة الاحتياطية هذه ملف **إضافي فقط** داخل `works/`؛ لم يُلمَس أي مشروع قائم.
