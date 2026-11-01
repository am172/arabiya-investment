import api from './client';

export const getCurrencies = async () => {
    try {
        const res = await api.get('/public/currencies');
        return res.data;
    } catch (error) {
        return null;
    }
};