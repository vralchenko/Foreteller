import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { calculatePythagoras, getZodiacSign, getChineseZodiac, getMoonPhaseInfo } from './numerology.js';

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
}

app.post('/api/analyze', async (req: Request<{}, {}, AnalyzeRequest>, res: Response) => {
    try {
        const { date, time, place, language = 'uk' } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const basicInfo = {
            zodiac: getZodiacSign(date),
            chineseZodiac: getChineseZodiac(date),
            pythagoras: calculatePythagoras(date),
            moon: getMoonPhaseInfo(date),
            input: { date, time, place }
        };

        let aiAnalysis: string | null = null;

        // If Groq is available (or customized via env), generate a detailed analysis
        if (process.env.GROQ_API_KEY) {
            try {
                let promptLanguage = 'Russian';
                if (language === 'en') promptLanguage = 'English';
                if (language === 'uk') promptLanguage = 'Ukrainian';
                if (language === 'de') promptLanguage = 'German';
                if (language === 'es') promptLanguage = 'Spanish';
                if (language === 'fr') promptLanguage = 'French';

                const prompt = `
          Analyze the character of a person born on ${date} at ${time || 'unknown time'} in ${place || 'unknown place'}.
          
          Data:
          - Zodiac: ${basicInfo.zodiac}
          - Chinese Zodiac: ${basicInfo.chineseZodiac}
          - Pythagoras Square: ${JSON.stringify(basicInfo.pythagoras)}
          - Moon Phase: ${basicInfo.moon.phase}
          
          Please provide a mystic and insightful description of their personality, strengths, weaknesses, and potential destiny.
          Keep it engaging and slightly esoteric but grounded in the data provided. 
          Language: ${promptLanguage}.
          Format: HTML (just the content tags, no html/body wrappers) suitable for embedding in a div. 
          Structure with <h3> headers for sections.
        `;

                const model = process.env.AI_MODEL_NAME || 'llama3-8b-8192';
                const apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

                const response = await axios.post(apiUrl, {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
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
