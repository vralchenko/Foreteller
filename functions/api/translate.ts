interface Env {
    GROQ_API_KEY: string;
    GROQ_API_URL: string;
    AI_MODEL_NAME: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json() as any;
        const { text, targetLang } = body;

        if (!text || !targetLang) {
            return Response.json({ error: 'Text and targetLang are required' }, { status: 400 });
        }

        const langMap: Record<string, string> = {
            'ru': 'Russian',
            'uk': 'Ukrainian',
            'en': 'English',
            'de': 'German',
            'fr': 'French',
            'es': 'Spanish'
        };

        const targetLangName = langMap[targetLang] || targetLang;

        const prompt = `ACT AS A PROFESSIONAL TRANSLATOR.
Translate the following HTML content into ${targetLangName}.
STRICTLY PRESERVE all HTML tags (<h3>, <strong>, <ul>, <li>, <p>, etc.) exactly as they are.
Translate ONLY the text content inside or between tags.
Do not add any explanations or extra text.
Do not use markdown like **.
Output ONLY the translated HTML content.

HTML to translate:
${text}`;

        if (!env.GROQ_API_KEY) {
            return Response.json({ error: 'API key missing' }, { status: 500 });
        }

        const model = env.AI_MODEL_NAME || 'llama3-8b-8192';
        const apiUrl = env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 4000
            })
        });

        const data = await response.json() as any;
        let translatedText = data.choices?.[0]?.message?.content || "";

        translatedText = translatedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        translatedText = translatedText.replace(/\*\*/g, '');

        return Response.json({ translatedText });
    } catch (err: any) {
        console.error("Translation API Error:", err.message);
        return Response.json({ error: 'Translation failed' }, { status: 500 });
    }
};
