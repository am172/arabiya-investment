const EURO = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'LU', 'SK', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY', 'HR'];

const MAP = {
    US: 'USD',
    GB: 'GBP',
    EG: 'EGP',
    SA: 'SAR',
    AE: 'AED',
    KW: 'KWD',
    QA: 'QAR',
    BH: 'BHD',
    OM: 'OMR',
    JO: 'JOD',
    IQ: 'IQD',
    LB: 'LBP',
    MA: 'MAD',
    DZ: 'DZD',
    TN: 'TND',
    LY: 'LYD',
    SD: 'SDG',
    TR: 'TRY',
    CA: 'CAD',
    AU: 'AUD',
    CH: 'CHF',
    SE: 'SEK',
    NO: 'NOK',
    DK: 'DKK',
    IN: 'INR',
    PK: 'PKR',
    MY: 'MYR',
    ID: 'IDR',
    CN: 'CNY',
    JP: 'JPY'
};

EURO.forEach((country) => {
    MAP[country] = 'EUR';
});

const countriesFor = (currency) => Object.keys(MAP).filter((country) => MAP[country] === currency);

module.exports = { MAP, countriesFor };