import api from './client';

export const submitProductRequest = async (payload) => {
    const res = await api.post('/public/requests', payload);
    return res.data;
};

export const toErrorMap = (errors) =>
    (Array.isArray(errors) ? errors : []).reduce(
        (acc, item) => (item && item.field && !acc[item.field] ? { ...acc, [item.field]: item.message } : acc),
        {}
    );