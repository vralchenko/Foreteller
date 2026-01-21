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
      1. INTEGRATED APPROACH: Do not analyze systems in isolation. Explain how being a ${zodiac} (Western) and a ${chineseZodiac} (Chinese) creates a unique energetic blend. How does the air/fire/water/earth element of the Zodiac interact with the animal trait?
      2. DEEP WESTERN ASTROLOGY: Provide a rich description of the ${zodiac} traits, including archetypes, ruling planets, and how they manifest in this specific individual.
      3. DEEP CHINESE ASTROLOGY: Elaborate on the ${chineseZodiac} animal energy, its social behavior, and hidden potential.
      4. MASTER NUMEROLOGY: Interpret the Pythagoras Square with clinical precision. Analyze not just single digits, but the STRENGTH OF LINES (e.g., Row 1: Vitality, Row 2: Family, Row 3: Habits) and DIAGONALS (Spirituality vs. Materialism).
      5. LUNAR MYSTICISM: Connect the ${moon.phase} to the subconscious mind, emotional reactions, and karmic memory.
      6. PERSONALIZATION: Always tailor the advice to a ${gender}. 

      VOLUME REQUIREMENT: 
      - The report must be extensive, professional, and visually structured (800-1200 words).
      
      REQUIRED SECTIONS (You MUST use these EXACT titles in <h3> tags):

      - <h3>🌌 ${headers.intro}</h3>
        A grand synthesis of the person's cosmic identity. Explain the overarching vibration of their birth date.

      - <h3>📐 ${headers.numerology}</h3>
        A deep dive into the Pythagoras Square. Discuss the character, energy, health, intelligence, and luck based on numerical distributions. Explain the meaning of horizontal, vertical, and diagonal lines.

      - <h3>🐉 ${headers.zodiac}</h3>
        The intersection of East and West. Detailed analysis of ${zodiac} and ${chineseZodiac}. How these two archetypes conflict or cooperate in one soul.

      - <h3>🌙 ${headers.moon}</h3>
        The inner mirror. Analysis of the ${moon.phase} and its influence on intuition and the emotional landscape.

      - <h3>❤️ ${headers.love}</h3>
        Psychological portrait in relationships. What they seek, what they fear, and compatibility keys for this ${gender}.

      - <h3>💼 ${headers.career}</h3>
        Strategy for success. Professional predispositions, leadership qualities, and financial karma.

      - <h3>🌿 ${headers.health}</h3>
        Psycho-somatic insights and energy protection based on the Psychomatrix balance.

      - <h3>🔮 ${headers.destiny}</h3>
        The Final Revelation. The mission of the soul, the core lesson of this life, and a powerful final blessing.

      FORMATTING:
      - Use ONLY HTML tags (<h3>, <p>, <strong>, <ul>, <li>). 
      - DO NOT use any Markdown symbols like asterisks (**), underscores (_), or hashes (#).
      - NEVER include raw JSON data, technical objects, "Working Numbers" strings, or bracketed counts in the response.
      - Present all information in flowing, professional text.
      - NO <html>/<body> tags.
      - Language: ${promptLanguage}.
      - Atmosphere: Premium, mystic, insightful, transformative.
    `;
}
