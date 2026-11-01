import api from './axiosInstance';

export default {
    status: () => api.get('/notifications'),
    updateSettings: (payload) => api.put('/notifications/settings', payload),
    subscribe: (subscription) => api.post('/notifications/subscribe', subscription),
    unsubscribe: (endpoint) => api.post('/notifications/unsubscribe', { endpoint }),
    test: () => api.post('/notifications/test')
};