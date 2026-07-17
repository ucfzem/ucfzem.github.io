const ALLOWED_ORIGINS = [
  'https://ucfzem.github.io',
  'https://tashkeel-five.vercel.app',
];

const FEW_SHOT_EXAMPLES = `
## أمثلة تدريبية (لا تضعها في الناتج)

### المثال 1: ظهيرة (خطأ شائع — لا تكتبها ظهور)
المُدخل: "في ظهيرة يوم مشمس"
الناتج الصحيح: "فِي ظَهِيرَةِ يَوْمٍ مُشَمَّسٍ"

### المثال 2: أليس (اسم علم — لا تكتبها أليس)
المُدخل: "ذهبت أليس الصغيرة مع أختها"
الناتج الصحيح: "ذَهَبَت أَلِيسُ الصَّغِيرَةُ مَعَ أُخْتِهَا"

### المثال 3: الفرق بين ياء وواو
المُدخل: "يكتب الكتاب بقلم"
الناتج الصحيح: "يَكْتُبُ الْكِتَابَ بِقَلَمٍ"

### المثال 4: شدة مطلوبة
المُدخل: "المدرس يشرح الدرس"
الناتج الصحيح: "الْمُدَرِّسُ يَشْرَحُ الدَّرْسَ"

### المثال 5: تنوين
المُدخل: "قرأ كتابا مفيدا"
الناتج الصحيح: "قَرَأَ كِتَاباً مُفِيداً"

### المثال 6: أسماء مع ال التعريف
المُدخل: "ذهب الولد إلى المدرسة"
الناتج الصحيح: "ذَهَبَ الْوَلَدُ إلَى الْمَدْرَسَةِ"

### المثال 7: همزة وصل وقطع
المُدخل: "أكل واشرب واذهب"
الناتج الصحيح: "كُلْ وَاشْرَبْ وَاذْهَبْ" (ملاحظة: فعل أمر من أكل يحذف الألف في الأمر: كُل)

### المثال 8: كلمات有三种 تشكيلات مختلفة
المُدخل: "العلم نور"
الناتج الصحيح: "الْعِلْمُ نُورٌ"

### المثال 9: لا تخلط بين علم (معرفة) وعَلَم (راية)
المُدخل: "رفع العلم عاليا"
الناتج الصحيح: "رَفَعَ الْعَلَمَ عَالِياً"

### المثال 10: كلمة "هذا" و"هذه"
المُدخل: "هذا كتاب وهذه قصة"
الناتج الصحيح: "هَذَا كِتَابٌ وَهَذِهِ قِصَّةٌ"

### المثال 11: ضمة على آخر الكلمة في حالة الرفع
المُدخل: "الكتاب مفيد"
الناتج الصحيح: "الْكِتَابُ مُفِيدٌ"

### المثال 12: فتحة على آخر الكلمة في حالة النصب
المُدخل: "قرأت الكتاب"
الناتج الصحيح: "قَرَأْتُ الْكِتَابَ"

### المثال 13: كسرة على آخر الكلمة في حالة الجر
المُدخل: "في الكتاب قصة"
الناتج الصحيح: "فِي الْكِتَابِ قِصَّةٌ"

### المثال 14: لا تحذف أو تغير حروف العلة
المُدخل: "يقول ويمشي ويسعى"
الناتج الصحيح: "يَقُولُ وَيَمْشِي وَيَسْعَى"

### المثال 15: اسم الجلالة
المُدخل: "بسم الله الرحمن الرحيم"
الناتج الصحيح: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"

### المثال 16: كلمات فيها تاء مربوطة
المُدخل: "الحديقة جميلة والفتاة ذكية"
الناتج الصحيح: "الْحَدِيقَةُ جَمِيلَةٌ وَالْفَتَاةُ ذَكِيَّةٌ"

### المثال 17: لام شمسية ولام قمرية
المُدخل: "الشمس والقمر والنجم والرجل"
الناتج الصحيح: "الشَّمْسُ وَالْقَمَرُ وَالنَّجْمُ وَالرَّجُلُ"
(ملاحظة: لام "ال" تُشمّس مع الحروف الشمسية: ش، قمرية تبقى: ق)

### المثال 18: النص الكامل لقصة أليس
المُدخل: "القصة في ظهيرة يوم مشمس ذهبت أليس الصغيرة مع أختها إلى الحديقة بينما جلست الأخت تقرأ كتابا كاد الملل أن يقتل أليس وقالت"
الناتج الصحيح: "الْقِصَّةُ فِي ظَهِيرَةِ يَوْمٍ مُشَمَّسٍ ذَهَبَت أَلِيسُ الصَّغِيرَةُ مَعَ أُخْتِهَا إلَى الْحَدِيقَةِ بَيْنَمَا جَلَسَتِ الْأُخْتُ تَقْرَأُ كِتَاباً كَادَ الْمَلَلُ أَنْ يَقْتُلَ أَلِيسَ وَقَالَتْ"
`;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée — utilisez POST' });
  }

  const { text, token, provider } = req.body || {};
  if (!text || !token) {
    return res.status(400).json({ error: 'النص أو المفتاح مفقود' });
  }

  try {
    if (provider === 'groq') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'tashkeel-vercel/1.0',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0,
          messages: [
            {
              role: 'system',
              content:
                'أنت خبير تشكيل نصوص عربية متخصص. مهمتك الوحيدة: إضافة التشكيل الكامل (الفتحة، الضمة، الكسرة، السكون، الشدة، التنوين) إلى النص المُدخل بدقة متناهية.' +
                '\n\nقانون الحديد (لا تنتهكه أبداً):' +
                '\n1. ❌ لا تغير أي حرف من الحروف الأصلية — ظهيرة ← ظَهِيرَة (وليس ظهور ❌)' +
                '\n2. ❌ لا تغترب الحروف — أليس (اسم علم) ← أَلِيس (وليس أَلْيَس ❌ أو أَلِس ❌)' +
                '\n3. ❌ لا تحذف حرفاً أو تبدله — ياء تبقى ياء، واو تبقى واو' +
                '\n4. ❌ لا تغير ترتيب الكلمات أو الحروف' +
                '\n5. ✅ يجب إضافة الشدة (ّ) على الحروف المضعّفة' +
                '\n6. ✅ أسماء العلم تبقى كما هي مع التشكيل فقط' +
                '\n\nقاعدة ذهبية: الحروف الأصلية هي الأمانة — لا تمسها بسوء. التشكيل فقط ما يُضاف.' +
                '\n\nأعد فقط النص المشكول كاملاً. لا تكتب أي مقدمة أو شرح أو تعليق.' +
                '\n\n' + FEW_SHOT_EXAMPLES,
            },
            { role: 'user', content: text },
          ],
        }),
      }).finally(() => clearTimeout(timeout));

      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        return res.status(r.status).json({
          error: errData.error?.message || `خطأ من Groq (${r.status})`,
        });
      }

      const data = await r.json();
      const result = data.choices?.[0]?.message?.content?.trim() || '';
      return res.status(200).json({ result });
    }

    if (provider === 'huggingface') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const r = await fetch(
        'https://api-inference.huggingface.co/models/basharalrfooh/Fine-Tashkeel',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'tashkeel-vercel/1.0',
          },
          body: JSON.stringify({
            inputs: text,
            parameters: { max_length: 2048 },
          }),
        }
      ).finally(() => clearTimeout(timeout));

      if (!r.ok) {
        const errText = await r.text().catch(() => '');
        if (r.status === 503) {
          return res.status(503).json({
            error: 'النموذج قيد التحميل على HuggingFace — حاول مرة أخرى بعد 30 ثانية',
            retry: true,
          });
        }
        return res.status(r.status).json({
          error: errText || `خطأ من HuggingFace (${r.status})`,
        });
      }

      const data = await r.json();
      const result =
        data?.[0]?.generated_text?.trim() ||
        data?.generated_text?.trim() ||
        (typeof data === 'string' ? data.trim() : '');
      if (!result) {
        return res.status(500).json({ error: 'لم نحصل على نتيجة من النموذج' });
      }
      return res.status(200).json({ result });
    }

    return res.status(400).json({ error: 'مزود غير مدعوم (استخدم groq أو huggingface)' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'خطأ في الخادم' });
  }
}
