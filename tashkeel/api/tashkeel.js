export default async function handler(req, res) {
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
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'أنت أداة تشكيل نصوص عربية دقيقة. أضف التشكيل الكامل (الحركات: الفتحة، الضمة، الكسرة، السكون، الشدة، التنوين) للنص المُدخل دون تغيير أي كلمة أو حرف أو ترتيب. أعد فقط النص المشكول، دون أي مقدمة أو شرح أو علامات اقتباس.',
            },
            { role: 'user', content: text },
          ],
        }),
      });

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
      const r = await fetch(
        'https://api-inference.huggingface.co/models/CAMeL-Lab/bert-base-arabic-camelbert-msa-diacritization',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!r.ok) {
        const errText = await r.text().catch(() => '');
        return res.status(r.status).json({
          error: errText || `خطأ من HuggingFace (${r.status})`,
        });
      }

      const data = await r.json();
      const result =
        data?.[0]?.generated_text ||
        data?.generated_text ||
        (typeof data === 'string' ? data : JSON.stringify(data));
      return res.status(200).json({ result });
    }

    return res.status(400).json({ error: 'مزود غير مدعوم (استخدم groq أو huggingface)' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'خطأ في الخادم' });
  }
}
