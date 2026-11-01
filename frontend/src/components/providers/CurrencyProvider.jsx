'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrencies } from '@/lib/api/currency';
import { STORAGE_KEY, pickCurrency, roundPrice } from '@/lib/utils/currency';

const CurrencyContext = createContext({
    ready: false,
    currencies: [],
    current: '',
    attribution: false,
    setCurrency: () => { },
    priceFor: (pkg) => ({
        price: pkg.price,
        discountPrice: pkg.discountPrice != null ? pkg.discountPrice : null,
        currency: pkg.currency,
        approx: false
    })
});

export function CurrencyProvider({ children }) {
    const [data, setData] = useState(null);
    const [current, setCurrent] = useState('');

    useEffect(() => {
        let active = true;
        getCurrencies().then((result) => {
            if (!active || !result || result.currencies.length === 0) return;
            setData(result);
            setCurrent(pickCurrency(result));
        });
        return () => {
            active = false;
        };
    }, []);

    const setCurrency = useCallback((code) => {
        setCurrent(code);
        try {
            localStorage.setItem(STORAGE_KEY, code);
        } catch (error) {
            return;
        }
    }, []);

    const value = useMemo(() => {
        const byCode = {};
        (data ? data.currencies : []).forEach((item) => {
            byCode[item.code] = item;
        });

        const priceFor = (pkg) => {
            const base = {
                price: pkg.price,
                discountPrice: pkg.discountPrice != null ? pkg.discountPrice : null,
                currency: pkg.currency,
                approx: false
            };
            if (!data || !current || current === pkg.currency) return base;

            const custom = (pkg.prices || []).find((item) => item.currency === current);
            if (custom) {
                return {
                    price: custom.price,
                    discountPrice: custom.discountPrice != null ? custom.discountPrice : null,
                    currency: current,
                    approx: false
                };
            }

            const target = byCode[current];
            const origin = byCode[pkg.currency];
            if (!target || !origin) return base;

            const factor = target.rate / origin.rate;
            return {
                price: roundPrice(pkg.price * factor, target.roundTo),
                discountPrice:
                    pkg.discountPrice != null ? roundPrice(pkg.discountPrice * factor, target.roundTo) : null,
                currency: current,
                approx: true
            };
        };

        return {
            ready: Boolean(data),
            currencies: data ? data.currencies : [],
            current,
            attribution: data ? data.attribution : false,
            setCurrency,
            priceFor
        };
    }, [data, current, setCurrency]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);