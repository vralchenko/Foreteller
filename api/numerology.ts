import { Moon } from 'lunarphase-js';

export function getZodiacSign(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month == 1 && day <= 19) || (month == 12 && day >= 22)) return "Capricorn";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
    return "Unknown";
}

export function getChineseZodiac(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const animals = [
        "Monkey", "Rooster", "Dog", "Pig",
        "Rat", "Ox", "Tiger", "Rabbit",
        "Dragon", "Snake", "Horse", "Goat"
    ];
    return animals[year % 12];
}

interface PythagorasResult {
    square: {
        [key: number]: number;
    };
    meta: {
        firstNum: number;
        secondNum: number;
        thirdNum: number;
        fourthNum: number;
    };
}

export function calculatePythagoras(dateStr: string): PythagorasResult {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return {
        square: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
        meta: { firstNum: 0, secondNum: 0, thirdNum: 0, fourthNum: 0 }
    };

    const y = parts[0];
    const m = parts[1];
    const d = parts[2];

    const allDigits = (d + m + y).split('').map(Number);
    const firstNum = allDigits.reduce((a, b) => a + b, 0);

    const secondNum = String(firstNum).split('').map(Number).reduce((a, b) => a + b, 0);

    const dNum = parseInt(d);
    let firstDigitDay = 0;
    if (dNum < 10) firstDigitDay = dNum;
    else firstDigitDay = Math.floor(dNum / 10);

    if (d.startsWith('0') && d.length === 2 && d !== '00') {
        firstDigitDay = parseInt(d);
    } else {
        firstDigitDay = parseInt(d[0]);
    }

    const thirdNum = firstNum - (2 * firstDigitDay);
    const fourthNum = String(thirdNum).split('').map(Number).reduce((a, b) => a + b, 0);

    const numberStream = (d + m + y + firstNum + secondNum + thirdNum + fourthNum);
    const calculatedDigits = numberStream.split('').map(Number);

    const counts: { [key: number]: number } = {
        1: 0, 2: 0, 3: 0,
        4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0
    };

    calculatedDigits.forEach(n => {
        if (counts[n] !== undefined) counts[n]++;
    });

    return {
        square: counts,
        meta: { firstNum, secondNum, thirdNum, fourthNum }
    };
}

interface MoonPhaseInfo {
    phase: string;
    emoji: string;
}

export function getMoonPhaseInfo(dateStr: string): MoonPhaseInfo {
    const date = new Date(dateStr);
    const phase = Moon.lunarPhase(date);
    const phaseEmoji = Moon.lunarPhaseEmoji(date);
    return { phase, emoji: phaseEmoji };
}
