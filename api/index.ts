import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { calculatePythagoras, getZodiacSign, getChineseZodiac, getMoonPhaseInfo } from './numerology.js';
import { generateAnalysisPrompt } from './prompts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

app.use(cors());
app.use(express.json());

interface AnalyzeRequest {
    date: string;
    time?: string;
    place?: string;
    language?: string;
    gender?: 'male' | 'female';
}

app.post('/api/analyze', async (req: Request<{}, {}, AnalyzeRequest>, res: Response) => {
    try {
        const { date, time, place, language = 'uk', gender = 'male' } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const basicInfo = {
            zodiac: getZodiacSign(date),
            chineseZodiac: getChineseZodiac(date),
            pythagoras: calculatePythagoras(date),
            moon: getMoonPhaseInfo(date),
            input: { date, time, place, gender }
        };

        let aiAnalysis: string | null = null;

        if (process.env.GROQ_API_KEY) {
            try {
                const prompt = generateAnalysisPrompt({
                    ...basicInfo.input,
                    language,
                    zodiac: basicInfo.zodiac,
                    chineseZodiac: basicInfo.chineseZodiac,
                    pythagoras: basicInfo.pythagoras,
                    moon: basicInfo.moon
                });

                const model = process.env.AI_MODEL_NAME || 'llama3-8b-8192';
                const apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

                const response = await axios.post(apiUrl, {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4000
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                aiAnalysis = response.data.choices[0]?.message?.content || "";

                // Post-processing to ensure clean HTML and no markdown stars
                if (aiAnalysis) {
                    // Replace markdown bold with HTML strong
                    aiAnalysis = aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    aiAnalysis = aiAnalysis.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    // Replace markdown headers with HTML headers
                    aiAnalysis = aiAnalysis.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                    aiAnalysis = aiAnalysis.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                    aiAnalysis = aiAnalysis.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                    // Remove double asterisks that might remain
                    aiAnalysis = aiAnalysis.replace(/\*\*/g, '');
                    // Remove list dashes if they leaked outside <ul>
                    aiAnalysis = aiAnalysis.replace(/^- /gm, '• ');
                    // Remove potential leftover JSON or technical artifacts
                    aiAnalysis = aiAnalysis.replace(/\{"1":.*?\}/g, '');
                    aiAnalysis = aiAnalysis.replace(/\["1":.*?\]/g, '');
                }

            } catch (err: any) {
                console.error("AI API Error:", err.response ? err.response.data : err.message);
                aiAnalysis = `AI Error: ${err.message}. Please check API credentials.`;
            }
        }

        // Log to Supabase
        if (supabase) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];

            try {
                const { error } = await supabase.from('usage_logs').insert([{
                    birth_date: date,
                    birth_time: time || null,
                    birth_place: place || null,
                    gender: gender,
                    language: language,
                    ip_address: Array.isArray(ip) ? ip[0] : String(ip),
                    user_agent: userAgent,
                    analysis_status: 'success'
                }]);

                if (error) {
                    console.error('Supabase insert error:', error.message, error.details);
                }
            } catch (err) {
                console.error('Failed to log to Supabase:', err);
            }
        }

        res.json({
            ...basicInfo,
            aiAnalysis
        });

    } catch (error: any) {
        console.error(error);

        // Log error to Supabase
        if (supabase) {
            try {
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                await supabase.from('usage_logs').insert([{
                    birth_date: req.body.date,
                    ip_address: Array.isArray(ip) ? ip[0] : String(ip),
                    analysis_status: 'error'
                }]);
            } catch (err) {
                console.error('Failed to log error to Supabase:', err);
            }
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
