import api from './axiosInstance';

export default {
    get: (slug) => api.get(`/legal/${slug}`),
    update: (slug, payload) => api.put(`/legal/${slug}`, payload),
    reset: (slug) => api.post(`/legal/${slug}/reset`)
};