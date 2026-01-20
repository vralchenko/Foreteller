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
                let promptLanguage = 'Russian';
                if (language === 'en') promptLanguage = 'English';
                if (language === 'uk') promptLanguage = 'Ukrainian';
                if (language === 'de') promptLanguage = 'German';
                if (language === 'es') promptLanguage = 'Spanish';
                if (language === 'fr') promptLanguage = 'French';

                const prompt = `
          ACT AS AN EXPERT ASTROLOGER, NUMEROLOGIST, AND COSMIC GUIDE. 
          Provide a DEEP, VOLUMINOUS, AND DETAILED character analysis for a ${gender} born on ${date} at ${time || 'unknown time'} in ${place || 'unknown place'}.
          
          TECHNICAL DATA TO INTERPRET:
          - WESTERN ZODIAC: ${basicInfo.zodiac}
          - CHINESE HOROSCOPE: ${basicInfo.chineseZodiac}
          - PYTHAGORAS SQUARE (Psychomatrix): ${JSON.stringify(basicInfo.pythagoras.square)}
          - PYTHAGORAS NUMEROLOGY META: ${JSON.stringify(basicInfo.pythagoras.meta)}
          - LUNAR PHASE: ${basicInfo.moon.phase} (Emoji: ${basicInfo.moon.emoji})

          YOUR TASK:
          1. Write a comprehensive analysis (at least 800-1000 words).
          2. Use a sophisticated, mystic, yet professional tone.
          3. Deeply analyze how these different systems overlap (e.g., how the ${basicInfo.zodiac} nature interacts with the ${basicInfo.chineseZodiac} energy).
          4. Detailed Pythagorean analysis: Don't just list numbers. Explain their combinations, horizontal/vertical lines, and diagonals of the square.
          5. Address the specific aspects of being a ${gender}.

          REQUIRED SECTIONS (Use <h3> for titles):
          - <h3>🌌 The Cosmic Blueprint</h3>: A grand introduction merging all systems.
          - <h3>📐 The Numerical Code of Soul</h3>: Deep dive into the Pythagoras Square, explaining the balance of energy, health, and character.
          - <h3>🐉 The Animal Spirit & Stars</h3>: Intersection of Western and Chinese zodiacs.
          - <h3>🌙 Lunar Emotional Tapestry</h3>: How the moon phase affects the inner world and intuition.
          - <h3>❤️ Love, Relationships & Compatibility</h3>: Detailed advice for personal life.
          - <h3>💼 Career, Success & Financial Growth</h3>: Professional path and potential.
          - <h3>🌿 Health & Vital Energy</h3>: Recommendations based on the energy balance.
          - <h3>🔮 The Ultimate Destiny</h3>: A powerful closing about the soul's mission in this incarnation.

          FORMATTING RULES:
          - Use HTML tags (<h3>, <p>, <strong>, <ul>, <li>). 
          - NO <html> or <body> tags.
          - Language: ${promptLanguage}.
          - Make it feel like a premium, personalized report.
        `;

                const model = process.env.AI_MODEL_NAME || 'llama3-8b-8192';
                const apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

                const response = await axios.post(apiUrl, {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 3000
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
