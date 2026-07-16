export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, token, provider } = req.body;

    if (!text || !token) {
        return res.status(400).json({ error: 'Missing text or token' });
    }

    const systemPrompt = 'أنت متخصص في التشكيل العربي. مهمتك إضافة التشكيل (الحركات: فتحة، ضمة، كسرة، سكون، تنوين) للنصوص العربية. أعد النص المشكّل فقط دون أي شرح أو تعليق إضافي.';
    const userPrompt = 'شكّل النص التالي:\n\n' + text;

    try {
        if (provider === 'huggingface') {
            const response = await fetch('https://api-inference.huggingface.co/models/CAMeL-Lab/bert-base-arabic-camelbert-msa-tashkeel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: text })
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.error || `Error ${response.status}` });
            }

            const result = Array.isArray(data) ? data[0]?.generated_text || JSON.stringify(data) : JSON.stringify(data);
            return res.status(200).json({ result });
        }

        // Default: Groq
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2048
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || `Error ${response.status}` });
        }

        const result = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({ result });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
