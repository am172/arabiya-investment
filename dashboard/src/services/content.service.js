import api from './axiosInstance';

export default {
    get: () => api.get('/content'),
    update: (payload) => api.put('/content', payload),
    reset: () => api.post('/content/reset')
};