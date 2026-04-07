import { calculatePythagoras, getZodiacSign, getChineseZodiac, getMoonPhaseInfo } from '../../api/numerology';
import { generateAnalysisPrompt } from '../../api/prompts';
import { createClient } from '@supabase/supabase-js';

interface Env {
    GROQ_API_KEY: string;
    GROQ_API_URL: string;
    AI_MODEL_NAME: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    let body: any = {};

    try {
        body = await request.json();
        const { date, time, place, language = 'uk', gender = 'male' } = body;

        if (!date) {
            return Response.json({ error: 'Date is required' }, { status: 400 });
        }

        const basicInfo = {
            zodiac: getZodiacSign(date),
            chineseZodiac: getChineseZodiac(date),
            pythagoras: calculatePythagoras(date),
            moon: getMoonPhaseInfo(date),
            input: { date, time, place, gender, language }
        };

        let aiAnalysis: string | null = null;

        if (env.GROQ_API_KEY) {
            try {
                const prompt = generateAnalysisPrompt({
                    ...basicInfo.input,
                    language,
                    zodiac: basicInfo.zodiac,
                    chineseZodiac: basicInfo.chineseZodiac,
                    pythagoras: basicInfo.pythagoras,
                    moon: basicInfo.moon
                });

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
                aiAnalysis = data.choices?.[0]?.message?.content || "";

                if (aiAnalysis) {
                    aiAnalysis = aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    aiAnalysis = aiAnalysis.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    aiAnalysis = aiAnalysis.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                    aiAnalysis = aiAnalysis.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                    aiAnalysis = aiAnalysis.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                    aiAnalysis = aiAnalysis.replace(/\*\*/g, '');
                    aiAnalysis = aiAnalysis.replace(/^- /gm, '• ');
                    aiAnalysis = aiAnalysis.replace(/\{"1":.*?\}/g, '');
                    aiAnalysis = aiAnalysis.replace(/\["1":.*?\]/g, '');
                }
            } catch (err: any) {
                console.error("AI API Error:", err.message);
                aiAnalysis = `AI Error: ${err.message}. Please check API credentials.`;
            }
        }

        // Log to Supabase
        if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
            const userAgent = request.headers.get('user-agent') || '';

            try {
                await supabase.from('usage_logs').insert([{
                    birth_date: date,
                    birth_time: time || null,
                    birth_place: place || null,
                    gender,
                    language,
                    ip_address: ip,
                    user_agent: userAgent,
                    analysis_status: 'success'
                }]);
            } catch (err) {
                console.error('Failed to log to Supabase:', err);
            }
        }

        return Response.json({ ...basicInfo, aiAnalysis });

    } catch (error: any) {
        console.error(error);

        if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
                const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
                const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
                await supabase.from('usage_logs').insert([{
                    birth_date: body.date,
                    ip_address: ip,
                    analysis_status: 'error'
                }]);
            } catch (err) {
                console.error('Failed to log error to Supabase:', err);
            }
        }

        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
