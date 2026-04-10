import { calculatePythagoras, getZodiacSign, getChineseZodiac, getMoonPhaseInfo } from '../../api/numerology';
import { generateCompatibilityPrompt } from '../../api/prompts';

interface Env {
    GROQ_API_KEY: string;
    GROQ_API_URL: string;
    AI_MODEL_NAME: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json() as any;
        const { partner1, partner2, language = 'uk' } = body;

        const getInfo = (data: any) => ({
            zodiac: getZodiacSign(data.date),
            chineseZodiac: getChineseZodiac(data.date),
            pythagoras: calculatePythagoras(data.date),
            moon: getMoonPhaseInfo(data.date),
            language,
            input: { ...data, language }
        });

        const info1 = getInfo(partner1);
        const info2 = getInfo(partner2);

        let aiCompatibility = "";

        if (env.GROQ_API_KEY) {
            const prompt = generateCompatibilityPrompt(info1 as any, info2 as any);
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
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            const data = await response.json() as any;
            aiCompatibility = data.choices?.[0]?.message?.content || "";
            aiCompatibility = aiCompatibility.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*/g, '');
        }

        return Response.json({
            partner1: info1,
            partner2: info2,
            aiCompatibility
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
