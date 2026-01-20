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
                let headers = {
                    intro: 'Космический чертеж',
                    numerology: 'Числовой код души',
                    zodiac: 'Дух животных и звезды',
                    moon: 'Лунный эмоциональный гобелен',
                    love: 'Любовь, отношения и совместимость',
                    career: 'Карьера, успех и финансовый рост',
                    health: 'Здоровье и жизненная энергия',
                    destiny: 'Высшее предназначение'
                };

                if (language === 'en') {
                    promptLanguage = 'English';
                    headers = {
                        intro: 'The Cosmic Blueprint',
                        numerology: 'The Numerical Code of Soul',
                        zodiac: 'The Animal Spirit & Stars',
                        moon: 'Lunar Emotional Tapestry',
                        love: 'Love, Relationships & Compatibility',
                        career: 'Career, Success & Financial Growth',
                        health: 'Health & Vital Energy',
                        destiny: 'The Ultimate Destiny'
                    };
                } else if (language === 'uk') {
                    promptLanguage = 'Ukrainian';
                    headers = {
                        intro: 'Космічне креслення',
                        numerology: 'Числовий код душі',
                        zodiac: 'Дух тварин і зірки',
                        moon: 'Місячне емоційне мереживо',
                        love: 'Кохання, стосунки та сумісність',
                        career: 'Кар’єра, успіх та фінансове зростання',
                        health: 'Здоров’я та життєва енергія',
                        destiny: 'Вище призначення'
                    };
                } else if (language === 'de') {
                    promptLanguage = 'German';
                    headers = {
                        intro: 'Der kosmische Bauplan',
                        numerology: 'Der numerische Code der Seele',
                        zodiac: 'Tiergeist & Sterne',
                        moon: 'Mond-Emotionsgeflecht',
                        love: 'Liebe, Beziehungen & Kompatibilität',
                        career: 'Karriere, Erfolg & finanzielles Wachstum',
                        health: 'Gesundheit & Vitalenergie',
                        destiny: 'Das ultimative Schicksal'
                    };
                } else if (language === 'es') {
                    promptLanguage = 'Spanish';
                    headers = {
                        intro: 'El plano cósmico',
                        numerology: 'El código numérico del alma',
                        zodiac: 'El espíritu animal y las estrellas',
                        moon: 'Tapiz emocional lunar',
                        love: 'Amor, relaciones y compatibilidad',
                        career: 'Carrera, éxito y crecimiento financiero',
                        health: 'Salud y energía vital',
                        destiny: 'El destino final'
                    };
                } else if (language === 'fr') {
                    promptLanguage = 'French';
                    headers = {
                        intro: 'Le plan cosmique',
                        numerology: 'Le code numérique de l\'âme',
                        zodiac: 'L\'esprit animal et les étoiles',
                        moon: 'Tapisserie émotionnelle lunaire',
                        love: 'Amour, relations et compatibilité',
                        career: 'Carrière, succès et croissance financière',
                        health: 'Santé et énergie vitale',
                        destiny: 'Le destin ultime'
                    };
                }

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
          3. Deeply analyze how these different systems overlap.
          4. Detailed Pythagorean analysis explaining combinations, lines, and diagonals.
          5. Address the specific aspects of being a ${gender}.

          REQUIRED SECTIONS (You MUST use these EXACT titles in <h3> tags):
          - <h3>🌌 ${headers.intro}</h3>
          - <h3>📐 ${headers.numerology}</h3>
          - <h3>🐉 ${headers.zodiac}</h3>
          - <h3>🌙 ${headers.moon}</h3>
          - <h3>❤️ ${headers.love}</h3>
          - <h3>💼 ${headers.career}</h3>
          - <h3>🌿 ${headers.health}</h3>
          - <h3>🔮 ${headers.destiny}</h3>

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
