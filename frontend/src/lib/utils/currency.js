export const STORAGE_KEY = 'academy-currency';

const ZONES = {
    'Africa/Cairo': 'EG',
    'Asia/Riyadh': 'SA',
    'Asia/Dubai': 'AE',
    'Asia/Kuwait': 'KW',
    'Asia/Qatar': 'QA',
    'Asia/Bahrain': 'BH',
    'Asia/Muscat': 'OM',
    'Asia/Amman': 'JO',
    'Asia/Baghdad': 'IQ',
    'Asia/Beirut': 'LB',
    'Africa/Casablanca': 'MA',
    'Africa/Algiers': 'DZ',
    'Africa/Tunis': 'TN',
    'Africa/Tripoli': 'LY',
    'Africa/Khartoum': 'SD',
    'Europe/London': 'GB',
    'Europe/Istanbul': 'TR',
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Los_Angeles': 'US',
    'America/Toronto': 'CA',
    'Australia/Sydney': 'AU'
};

export const roundPrice = (value, step) => {
    const number = Number(value) || 0;
    return step >= 1 ? Math.round(number / step) * step : Math.round(number * 100) / 100;
};

export const formatMoney = (value, currency) => {
    const number = Number(value) || 0;
    try {
        return new Intl.NumberFormat('ar-EG-u-nu-latn', {
            style: 'currency',
            currency,
            maximumFractionDigits: Number.isInteger(number) ? 0 : 2
        }).format(number);
    } catch (error) {
        return `${number} ${currency}`;
    }
};

const regionHints = () => {
    const hints = [];
    try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (ZONES[zone]) hints.push(ZONES[zone]);
    } catch (error) {
        hints.push('');
    }
    (navigator.languages || [navigator.language]).forEach((language) => {
        const region = String(language || '').split('-')[1];
        if (region) hints.push(region.toUpperCase());
    });
    return hints.filter(Boolean);
};

export const readSaved = (codes) => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved && codes.includes(saved) ? saved : '';
    } catch (error) {
        return '';
    }
};

export const pickCurrency = (data) => {
    const codes = data.currencies.map((item) => item.code);
    const saved = readSaved(codes);
    if (saved) return saved;
    if (!data.autoDetect) return data.primary;
    if (data.detected.currency && codes.includes(data.detected.currency)) return data.detected.currency;

    for (const hint of regionHints()) {
        const match = data.currencies.find((item) => item.countries.includes(hint));
        if (match) return match.code;
    }
    return data.primary;
};