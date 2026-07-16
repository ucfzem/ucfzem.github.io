export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, token } = req.body;

    if (!text || !token) {
        return res.status(400).json({ error: 'Missing text or token' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت متخصص في التشكيل العربي. مهمتك إضافة التشكيل (الحركات: فتحة، ضمة، كسرة، سكون، تنوين) للنصوص العربية. أعد النص المشكّل فقط دون أي شرح أو تعليق إضافي.'
                    },
                    {
                        role: 'user',
                        content: 'شكّل النص التالي:\n\n' + text
                    }
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