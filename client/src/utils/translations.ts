import { Language } from '../types';
import { ZODIAC_TRANSLATIONS, CHINESE_ZODIAC_TRANSLATIONS } from '../constants/translations';

export const translateZodiac = (sign: string, lang: Language): string => {
    return ZODIAC_TRANSLATIONS[lang]?.[sign] || sign;
};

export const translateChineseZodiac = (animal: string, lang: Language): string => {
    return CHINESE_ZODIAC_TRANSLATIONS[lang]?.[animal] || animal;
};
