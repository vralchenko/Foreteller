export interface FormData {
    date: string;
    time: string;
    place: string;
    gender: 'male' | 'female';
}

export interface PythagorasSquare {
    [key: number]: number;
}

export interface AnalysisResult {
    zodiac: string;
    chineseZodiac: string;
    pythagoras: {
        square: PythagorasSquare;
        meta: {
            firstNum: number;
            secondNum: number;
            thirdNum: number;
            fourthNum: number;
        };
    };
    moon: {
        phase: string;
        emoji: string;
    };
    aiAnalysis?: string;
    input?: {
        date: string;
        time?: string;
        place?: string;
        gender: string;
        language: string;
    };
}

export type Language = 'en' | 'de' | 'fr' | 'es' | 'uk' | 'ru';

export interface Translations {
    title: string;
    subtitle: string;
    dob: string;
    time: string;
    place: string;
    gender: string;
    male: string;
    female: string;
    submit: string;
    loading: string;
    zodiac: string;
    chinese: string;
    pythagoras: string;
    moon: string;
    analysis: string;
    error: string;
    defaultPlace: string;
    downloadPdf: string;
}
