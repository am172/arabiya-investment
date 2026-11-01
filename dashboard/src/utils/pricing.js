export const roundPrice = (value, step) => {
    const number = Number(value) || 0;
    return step >= 1 ? Math.round(number / step) * step : Math.round(number * 100) / 100;
};

export const buildRates = (settings) => {
    const rates = { [settings.primary]: 1 };
    const round = { [settings.primary]: 0 };
    settings.secondary.forEach((item) => {
        const rate = settings.effective[item.code];
        if (rate) {
            rates[item.code] = rate;
            round[item.code] = item.roundTo;
        }
    });
    return { rates, round };
};

export const convert = (value, from, to, table) => {
    const amount = Number(value);
    const source = table.rates[from];
    const target = table.rates[to];
    if (!Number.isFinite(amount) || !source || !target) return null;
    return roundPrice((amount * target) / source, table.round[to] || 0);
};