import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { calculatePythagoras, getZodiacSign, getChineseZodiac, getMoonPhaseInfo } from './numerology.js';
import { generateAnalysisPrompt } from './prompts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

            } catch (err: any) {
                console.error("AI API Error:", err.response ? err.response.data : err.message);
                aiAnalysis = `AI Error: ${err.message}. Please check API credentials.`;
            }
        }

        res.json({
            ...basicInfo,
            aiAnalysis
        });

    } catch (error) {
        console.error(error);
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
