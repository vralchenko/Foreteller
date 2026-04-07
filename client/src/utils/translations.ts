import { Language } from '../types';
import { ZODIAC_TRANSLATIONS, CHINESE_ZODIAC_TRANSLATIONS, MOON_PHASE_TRANSLATIONS } from '../constants/translations';

export const translateZodiac = (sign: string, lang: Language): string => {
    return ZODIAC_TRANSLATIONS[lang]?.[sign] || sign;
};

export const translateChineseZodiac = (animal: string, lang: Language): string => {
    return CHINESE_ZODIAC_TRANSLATIONS[lang]?.[animal] || animal;
};

export const translateMoonPhase = (phase: string, lang: Language): string => {
    return MOON_PHASE_TRANSLATIONS[lang]?.[phase] || phase;
};
