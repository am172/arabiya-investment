export const CURRENCY_CODES = [
    'USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'IQD', 'LBP', 'MAD',
    'DZD', 'TND', 'LYD', 'SDG', 'TRY', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK', 'DKK', 'INR', 'PKR', 'MYR',
    'IDR', 'CNY', 'JPY'
];

const names = (() => {
    try {
        return new Intl.DisplayNames(['ar'], { type: 'currency' });
    } catch (error) {
        return null;
    }
})();

export const currencyName = (code) => {
    try {
        return names ? names.of(code) : code;
    } catch (error) {
        return code;
    }
};

export const currencyLabel = (code) => `${code} — ${currencyName(code)}`;

export const currencyOptions = (exclude = []) =>
    CURRENCY_CODES.filter((code) => !exclude.includes(code)).map((code) => ({
        value: code,
        label: currencyLabel(code)
    }));