export interface PromptData {
  date: string;
  time?: string;
  place?: string;
  gender: 'male' | 'female';
  language: string;
  zodiac: string;
  chineseZodiac: string;
  pythagoras: any;
  moon: any;
}

export function generateAnalysisPrompt(data: PromptData): string {
  const { date, time, place, gender, language, zodiac, chineseZodiac, pythagoras, moon } = data;

  let promptLanguage = 'Russian';
  let headers = {
    intro: 'Космический чертеж',
    numerology: 'Числовой код души',
    zodiac: 'Дух животных и звезды',
    moon: 'Лунный эмоциональный гобелен',
    love: 'Любовь, отношения и совместимость',
    career: 'Карьера, успех и финансовый рост',
    health: 'Здоровье и жизненная энергия',
    destiny: 'Высшее предназначение',
    keyInsight: 'Ключевой инсайт'
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
      destiny: 'The Ultimate Destiny',
      keyInsight: 'Key Insight'
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
      destiny: 'Вище призначення',
      keyInsight: 'Ключовий інсайт'
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
      destiny: 'Das ultimative Schicksal',
      keyInsight: 'Haupterkenntnis'
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
      destiny: 'El destino final',
      keyInsight: 'Idea clave'
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
      destiny: 'Le destin ultime',
      keyInsight: 'Aperçu clé'
    };
  }

  return `
      ACT AS AN EXPERT ASTROLOGER, NUMEROLOGIST, AND COSMIC GUIDE. 
      Provide a PROFOUND, HIGHLY DETAILED, AND VOLUMINOUS character analysis for a ${gender} born on ${date} at ${time || 'unknown time'} in ${place || 'unknown place'}.
      
      TECHNICAL CORE DATA:
      - WESTERN ZODIAC SIGN: ${zodiac}
      - CHINESE ZODIAC ANIMAL: ${chineseZodiac}
      - PYTHAGORAS SQUARE (Psychomatrix Counts):
        1 (Character/Will): ${pythagoras.square[1]}
        2 (Energy): ${pythagoras.square[2]}
        3 (Interest/Knowledge): ${pythagoras.square[3]}
        4 (Health): ${pythagoras.square[4]}
        5 (Logic/Intuition): ${pythagoras.square[5]}
        6 (Physical Labor/Skills): ${pythagoras.square[6]}
        7 (Luck/Talent): ${pythagoras.square[7]}
        8 (Duty/Responsibility): ${pythagoras.square[8]}
        9 (Memory/Intellect): ${pythagoras.square[9]}
      - NUMEROLOGY WORKING NUMBERS: ${pythagoras.meta.firstNum}, ${pythagoras.meta.secondNum}, ${pythagoras.meta.thirdNum}, ${pythagoras.meta.fourthNum}
      - LUNAR PHASE: ${moon.phase} (Symbol: ${moon.emoji})

      IMPORTANT: DO NOT repeat the technical data lists or raw counts (e.g., "1: 5, 2: 3") in the report. Interpret what these numbers mean as professional insights.

      YOUR GUIDELINES FOR A COMPREHENSIVE ANALYSIS:
      1. INTEGRATED APPROACH: Do not analyze systems in isolation. Explain how being a ${zodiac} (Western) and a ${chineseZodiac} (Chinese) creates a unique energetic blend.
      2. PERSONALIZATION: Always tailor the advice to a ${gender}. 

      VOLUME REQUIREMENT: 
      - The report must be CONCISE, IMPACTFUL, and visually easy to read (max 500-700 words).
      - Use SHORT paragraphs (3-4 sentences maximum).
      - Use BULLET POINTS for key traits, strengths, and advice.
      
      REQUIRED SECTIONS (You MUST use these EXACT titles in <h3> tags):
      Each section structure:
      1. One clear analysis paragraph.
      2. A bulleted list of 3 specific points.
      3. A <strong>✨ ${headers.keyInsight}:</strong> sentence at the end of each section.

      - <h3>🌌 ${headers.intro}</h3>
        A punchy synthesis of the cosmic identity.

      - <h3>📐 ${headers.numerology}</h3>
        Core traits from the Psychomatrix. Focus on the most unique numerical combinations.

      - <h3>🐉 ${headers.zodiac}</h3>
        How ${zodiac} and ${chineseZodiac} interact.

      - <h3>🌙 ${headers.moon}</h3>
        Subconscious patterns and intuition.

      - <h3>❤️ ${headers.love}</h3>
        Relationship keys and advice.

      - <h3>💼 ${headers.career}</h3>
        Professional strategy and success potential.

      - <h3>🌿 ${headers.health}</h3>
        Energy maintenance tips.

      - <h3>🔮 ${headers.destiny}</h3>
        Final soul mission and a short blessing.

      FORMATTING:
      - Use ONLY HTML tags (<h3>, <p>, <strong>, <ul>, <li>). 
      - DO NOT use any Markdown symbols (** # * _).
      - NEVER include raw JSON, technical counts, or bracketed numbers.
      - Present all information in flowing, professional text.
      - NO <html>/<body> tags.
      - Language: STRICTLY ${promptLanguage}. Translate everything, including labels and concepts.
      - DO NOT use English words in a non-English report.
      - Atmosphere: Premium, mystic, insightful, transformative.
    `;
}
export function generateCompatibilityPrompt(p1: PromptData, p2: PromptData): string {
  let promptLanguage = 'Russian';
  let headers = {
    intro: 'Синергия Душ',
    numerology: 'Нумерологический Резонанс',
    zodiac: 'Звездное Притяжение',
    advice: 'Совет Космоса'
  };

  if (p1.language === 'en') {
    promptLanguage = 'English';
    headers = { intro: 'Soul Synergy', numerology: 'Numerical Resonance', zodiac: 'Stellar Attraction', advice: 'Cosmic Advice' };
  } else if (p1.language === 'uk') {
    promptLanguage = 'Ukrainian';
    headers = { intro: 'Синергія Душ', numerology: 'Нумерологічний Резонанс', zodiac: 'Зоряне Тяжіння', advice: 'Порада Космосу' };
  } else if (p1.language === 'de') {
    promptLanguage = 'German';
    headers = { intro: 'Seelensymbiose', numerology: 'Numerische Resonanz', zodiac: 'Stellare Anziehung', advice: 'Kosmischer Rat' };
  } else if (p1.language === 'es') {
    promptLanguage = 'Spanish';
    headers = { intro: 'Sinergia de Almas', numerology: 'Resonancia Numérica', zodiac: 'Atracción Estelar', advice: 'Consejo Cósmico' };
  } else if (p1.language === 'fr') {
    promptLanguage = 'French';
    headers = { intro: 'Synergie des Âmes', numerology: 'Résonance Numérique', zodiac: 'Attraction Stellaire', advice: 'Conseil Cosmique' };
  }

  return `
      ACT AS A MASTER ASTROLOGER AND NUMEROLOGIST.
      Analyze the compatibility between two partners.
      
      Partner 1: ${p1.gender}, ${p1.zodiac} (${p1.chineseZodiac}), Pythagoras Square: ${JSON.stringify(p1.pythagoras.square)}
      Partner 2: ${p2.gender}, ${p2.zodiac} (${p2.chineseZodiac}), Pythagoras Square: ${JSON.stringify(p2.pythagoras.square)}
      
      Volume: 400-600 words.
      Format: HTML (<h3>, <p>, <ul>, <li>, <strong>, <table>).
      Language: ${promptLanguage}.
      
      CRITICAL INSTRUCTIONS:
      1. DO NOT show raw JSON data like {"1": 5...} in the output.
      2. In the "${headers.numerology}" section, draw the 3x3 Pythagoras squares for BOTH partners using <table> with thin borders.
      3. Compare their psychomatrices visually and conceptually.
      
      Structure:
      - <h3>💞 ${headers.intro}</h3>
        General feeling of the union.
      - <h3>📐 ${headers.numerology}</h3>
        Draw squares for P1 and P2 side-by-side (if possible using CSS/tables) and analyze how their psychomatrices interact.
      - <h3>✨ ${headers.zodiac}</h3>
        Astrological connection.
      - <h3>🔮 ${headers.advice}</h3>
        Practical advice for the relationship.
  `;
}
