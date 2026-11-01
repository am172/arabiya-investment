import api from './axiosInstance';

export default {
    get: () => api.get('/texts'),
    update: (payload) => api.put('/texts', payload),
    reset: () => api.post('/texts/reset')
};