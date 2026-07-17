const ALLOWED_ORIGINS = [
  'https://ucfzem.github.io',
  'https://tashkeel-five.vercel.app',
];

const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;

function stripTashkeel(s) {
  return s.replace(TASHKEEL_REGEX, '');
}

function validateLetters(input, output) {
  const bareInput = stripTashkeel(input).trim();
  const bareOutput = stripTashkeel(output).trim();
  if (bareInput !== bareOutput) {
    return {
      valid: false,
      detail: {
        input: bareInput,
        output: bareOutput,
        mismatchAt: findFirstDiff(bareInput, bareOutput),
      },
    };
  }
  return { valid: true };
}

function findFirstDiff(a, b) {
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) return i;
  }
  return minLen;
}

const FEW_SHOT_EXAMPLES = `
## أمثلة تدريبية (لا تضعها في الناتج)

### المثال 1: ظهيرة (خطأ شائع — لا تكتبها ظهور)
المُدخل: "في ظهيرة يوم مشمس"
الناتج الصحيح: "فِي ظَهِيرَةِ يَوْمٍ مُشْمِسٍ"

### المثال 1b: مقمرة (خطأ شائع — لا تكتبها مقمرة)
المُدخل: "في ليلة مقمرة"
الناتج الصحيح: "فِي لَيْلَةٍ مُقْمِرَةٍ"

### المثال 1c: مشمس (خطأ شائع — لا تكتبها مشمس)
المُدخل: "يوم مشمس جميل"
الناتج الصحيح: "يَوْمٌ مُشْمِسٌ جَمِيلٌ"

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

### المثال 8: كلمات معروفة
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
الناتج الصحيح: "الْقِصَّةُ فِي ظَهِيرَةِ يَوْمٍ مُشْمِسٍ ذَهَبَت أَلِيسُ الصَّغِيرَةُ مَعَ أُخْتِهَا إلَى الْحَدِيقَةِ بَيْنَمَا جَلَسَتِ الْأُخْتُ تَقْرَأُ كِتَاباً كَادَ الْمَلَلُ أَنْ يَقْتُلَ أَلِيسَ وَقَالَتْ"
`;

async function callGroq(text, token) {
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
            'أنت خبير تشكيل نصوص عربية متخصص بالمورفولوجيا (الصرف) والقواعد (النحو). مهمتك: إضافة التشكيل الكامل بدقة.' +
            '\n\n═══════════════════════════════' +
            '\nالقوانين الصارمة (لا تنتهك أبداً):' +
            '\n1. ❌ لا تغير أي حرف من الحروف الأصلية — فقط أضف التشكيل فوقها وتحتها' +
            '\n2. ❌ الأسماء الأعجمية (مثل أليس Alice) تبقى حروفها كما هي: أَلِيس (وليس أَلْيَس)' +
            '\n3. ❌ لا تحذف ياء أو واو أو ألف أو أي حرف' +
            '\n4. ❌ لا تغير تاء مربوطة (ة) إلى هاء (ه) والعكس' +
            '\n5. ❌ لا تغير ترتيب الكلمات' +
            '\n6. ✅ الشدة (ّ) واجبة على الحروف المضعّفة' +

            '\n\n═══════════════════════════════' +
            '\nقواعد الصرف — أوزان المشتقات (مهم جداً):' +

            '\n\n【اسم الفاعل (active participle)】' +
            '\n• وزن "مُفْعِل" من الفعل الرباعي (أفعل):' +
            '\n  - أَشْمَسَ (to be sunny) → مُشْمِس (sunny day) — وليس مُشَمَّس!' +
            '\n  - أَقْمَرَ (to be moonlit) → مُقْمِر (moonlit night) — وليس مُقَمَّر!' +
            '\n  - أَكْرَمَ → مُكْرِم  |  أَحْسَنَ → مُحْسِن' +
            '\n• وزن "فَاعِل" من الفعل الثلاثي:' +
            '\n  - كَتَبَ → كَاتِب  |  جَلَسَ → جَالِس  |  قَتَلَ → قَاتِل' +

            '\n\n【اسم المفعول (passive participle)】' +
            '\n• وزن "مَفْعُول" من الثلاثي: كَتَبَ → مَكْتُوب  |  قَتَلَ → مَقْتُول' +
            '\n• وزن "مُفْعَل" من الرباعي: أَكْرَمَ → مُكْرَم  |  شَمَّسَ → مُشَمَّس (شيء معرّض للشمس)' +
            '\n• وزن "مُفَعَّل" من فعل مضعّف: دَرَّسَ → مُدَرِّس  |  شَدَّدَ → مُشَدَّد' +

            '\n\n【أوزان مهمة للتمييز بين الكلمات المتشابهة】' +
            '\n• فَعِيلَة (اسم): ظَهِيرَة (afternoon) ← جذر ظ-ه-ر' +
            '\n• فُعُول (مصدر): ظُهُور (appearance) ← جذر ظ-ه-ر' +
            '\n  → الفرق: الحرف الثالث ياء (ي) يعطي فَعِيلَة، بينما واو (و) يعطي فُعُول' +
            '\n  → إذا كان المدخل يحتوي ياء فهو فَعِيلَة (ظهيرة)، إذا واو فهو فُعُول (ظهور)' +
            '\n• فَعِيل (صفة): كَرِيم  |  جَمِيل  |  عَلِيم' +
            '\n• فُعُول (مصدر): دُخُول  |  خُرُوج  |  قُعُود' +
            '\n• تَفْعِيل (مصدر): تَدْرِيس  |  تَشْكِيل  |  تَعْلِيم' +
            '\n• فَعَالَة (مصدر): جَمَال  |  كَمَال  |  جَلَال' +
            '\n• إفْعَال (مصدر رباعي): إشْمَاس  |  إكْرَام  |  إحْسَان' +

            '\n\n═══════════════════════════════' +
            '\nقواعد الإعلال — الحروف المعتلة (ياء، واو، ألف):' +
            '\n• ياء ساكنة بعد فتحة ← ألف: قَامَ (أصلها قَوَمَ)' +
            '\n• ياء ساكنة بعد كسرة ← تبقى ياء: جِيل (وليس جال)' +
            '\n• واو ساكنة بعد ضمة ← تبقى واو: نُور (وليس نار)' +
            '\n• الألف اللينة في آخر الفعل: يَدْعُو، يَرْمِي، يَسْعَى' +

            '\n\n═══════════════════════════════' +
            '\nقواعد النحو — الإعراب (case endings):' +
            '\n• المبتدأ مرفوع بالضمة: الْكِتَابُ  |  الْوَلَدُ' +
            '\n• الفاعل مرفوع بالضمة: ذَهَبَ الْوَلَدُ  |  جَاءَ الْمُدَرِّسُ' +
            '\n• المفعول به منصوب بالفتحة: قَرَأَ الْكِتَابَ  |  رَأَى الْوَلَدَ' +
            '\n• المجرور بالكسرة (بعد حرف جر أو مضاف إليه): فِي الْكِتَابِ  |  كِتَابُ الْوَلَدِ' +
            '\n• المنادى: يَا عَبْدَ اللَّهِ (منصوب — مفرد علم مبني)' +
            '\n• التمييز: اِشْتَرَيْتُ كِيلُوَ تَفَّاحٍ (منصوب/مجرور)' +

            '\n\n═══════════════════════════════' +
            '\nقواعد مهمة أخرى:' +
            '\n【اللام الشمسية والقمرية】' +
            '\n• اللام الشمسية (مع 14 حرفاً: ت ث د ذ ر ز س ش ص ض ط ظ ل ن) — الحرف الشمسي يأخذ الشدة:"' +
            '\n  - الشَّمْس (وليس الْشَمْس)  |  الطَّقْس (وليس الْطَقْس)  |  النَّجْم (وليس الْنَجْم)  |  الصَّبْر' +
            '\n• اللام القمرية (مع باقي الحروف) — اللام تظهر ساكنة:"' +
            '\n  - الْقَمَر  |  الْكِتَاب  |  الْوَلَد  |  الْجَمِيل' +
            '\n【التنوين】' +
            '\n• تنوين الضم (ٌ) في الرفع: كِتَابٌ  |  وَلَدٌ' +
            '\n• تنوين الفتح (ً) في النصب: كِتَاباً  |  وَلَداً (تضاف ألف مع التنوين)' +
            '\n• تنوين الكسر (ٍ) في الجر: كِتَابٍ  |  وَلَدٍ' +
            '\n【التاء المربوطة (ة)】' +
            '\n• تبقى هاء (ه) عند الوقف وتاء (ت) عند الوصل إذا جاء بعدها مضاف إليه أو صفة' +
            '\n• جَامِعَةُ الْقَاهِرَةِ — الْحَدِيقَةُ جَمِيلَةٌ' +
            '\n【الأسماء الأعجمية والأعلام】' +
            '\n• لا تغير حروفها مطلقاً — التشكيل فقط على الحروف الموجودة:' +
            '\n  - أليس ← أَلِيس (وليس أَلْيَس)' +
            '\n  - أليسون ← أَلِيسُون (وليس أَلْيَسُون)' +
            '\n  - إنجليزية ← إِنْجِلِيزِيَّة (وليس إنجليزي)' +
            '\n  - باريس ← بَارِيس (وليس بَارِس)' +
            '\n  - يأجوج ومأجوج ← يَأْجُوج وَمَأْجُوج' +
            '\n  - موسى وعيسى ← مُوسَى وَعِيسَى' +
            '\n【فعل الأمر (imperative)】' +
            '\n• من الفعل الثلاثي الصحيح يكون على وزن "اِفْعَل" إذا كان ماضيه فتحة العين:' +
            '\n  - كَتَبَ → اُكْتُب (ضمة مع همزة وصل)' +
            '\n  - دَرَسَ → اُدْرُس  |  جَلَسَ → اِجْلِس  |  فَتَحَ → اِفْتَح' +
            '\n【همزة الوصل والقطع】' +
            '\n• همزة الوصل (ال) — تظهر عند البدء وتسقط عند الوصل: اَلْوَلَدُ' +
            '\n• همزة القطع (أَ، إِ، أُ) — تظهر دائماً: أَكَلَ، إِذَا، أُخْت' +

            '\n\n═══════════════════════════════' +
            '\nخطوات العمل (اتبع هذا التسلسل):' +
            '\n1. اقرأ النص الأصلي كاملاً' +
            '\n2. طابق كل كلمة مع وزنها الصرفي (وزن الكلمة يحدد تشكيلها)' +
            '\n3. للأسماء: حدد هل هو اسم علم (يثبت بدون تغيير الحروف) أم اسم عادي' +
            '\n4. حدد إعراب الكلمة في الجملة (رفع/نصب/جر)' +
            '\n5. أضف التشكيل الكامل مع الشدة والتنوين' +
            '\n6. راجع أن الحروف الأصلية لم تتغير — أزل التشكيل ذهنياً وقارن مع المدخل' +

            '\n\nقاعدة ذهبية: الحروف الأصلية أمانة. التشكيل فقط ما يُضاف.' +
            '\nأعد فقط النص المشكول كاملاً بدون أي شرح.' +
            '\n\n' + FEW_SHOT_EXAMPLES,
        },
        { role: 'user', content: text },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw { status: r.status, message: errData.error?.message || `خطأ من Groq (${r.status})` };
  }

  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function callGitHub(text, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const r = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'tashkeel-vercel/1.0',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'أنت خبير تشكيل نصوص عربية متخصص بالمورفولوجيا (الصرف) والقواعد (النحو). مهمتك: إضافة التشكيل الكامل بدقة.' +
            '\n\n═══════════════════════════════' +
            '\nالقوانين الصارمة (لا تنتهك أبداً):' +
            '\n1. ❌ لا تغير أي حرف من الحروف الأصلية — فقط أضف التشكيل فوقها وتحتها' +
            '\n2. ❌ الأسماء الأعجمية (مثل أليس Alice) تبقى حروفها كما هي: أَلِيس (وليس أَلْيَس)' +
            '\n3. ❌ لا تحذف ياء أو واو أو ألف أو أي حرف' +
            '\n4. ❌ لا تغير تاء مربوطة (ة) إلى هاء (ه) والعكس' +
            '\n5. ❌ لا تغير ترتيب الكلمات' +
            '\n6. ✅ الشدة (ّ) واجبة على الحروف المضعّفة' +
            '\n\n【اسم الفاعل】وزن "مُفْعِل": مشمس ← مُشْمِس (وليس مُشَمَّس) | مقمر ← مُقْمِر (وليس مُقَمَّر)' +
            '\n【اللام الشمسية】الحرف الشمسي يأخذ الشدة: الطَّقْس (وليس الْطَقْس) | الشَّمْس (وليس الْشَمْس)' +
            '\n【الأسماء الأعجمية】أليس ← أَلِيس | باريس ← بَارِيس | موسى ← مُوسَى' +
            '\n\nقاعدة ذهبية: الحروف الأصلية أمانة. التشكيل فقط ما يُضاف.' +
            '\nأعد فقط النص المشكول كاملاً بدون أي شرح.',
        },
        { role: 'user', content: text },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw { status: r.status, message: errData.error?.message || `خطأ من GitHub (${r.status})` };
  }

  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function callHuggingFace(text, token) {
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
      throw { status: 503, message: 'النموذج قيد التحميل على HuggingFace — حاول مرة أخرى بعد 30 ثانية', retry: true };
    }
    throw { status: r.status, message: errText || `خطأ من HuggingFace (${r.status})` };
  }

  const data = await r.json();
  const result =
    data?.[0]?.generated_text?.trim() ||
    data?.generated_text?.trim() ||
    (typeof data === 'string' ? data.trim() : '');
  return result;
}

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

    const isRateLimit = (e) =>
      e.status === 429 || (e.message && e.message.includes('Rate limit'));

    try {
      const providers = provider === 'groq' || provider === 'huggingface' || provider === 'github'
        ? [provider]
        : ['groq', 'github', 'huggingface'];

      const errors = [];

      for (const prov of providers) {
        try {
          let result = '';

          if (prov === 'groq') {
            result = await callGroq(text, token);
          } else if (prov === 'github') {
            result = await callGitHub(text, token);
          } else {
            result = await callHuggingFace(text, token);
          }

          if (!result) {
            errors.push(`${prov}: returned empty`);
            continue;
          }

          const validation = validateLetters(text, result);
          if (validation.valid) {
            return res.status(200).json({ result });
          }

          errors.push(`${prov}: letter mismatch — input "${stripTashkeel(text).trim()}" ≠ output "${stripTashkeel(result).trim()}"`);

        } catch (e) {
          if (e.retry) return res.status(503).json({ error: e.message, retry: true });
          if (isRateLimit(e)) {
            return res.status(429).json({ error: e.message, retry_after: 15 });
          }
          errors.push(`${prov}: ${e.message || e}`);
        }
      }

      return res.status(422).json({
        error: errors.join(' | '),
        hint: 'جرب مزوداً آخر أو انتظر قليلاً',
      });

    } catch (e) {
      return res.status(500).json({ error: e.message || 'خطأ في الخادم' });
    }
}
