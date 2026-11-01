import api from './axiosInstance';

export default {
    get: () => api.get('/cloudinary'),
    test: (payload) => api.post('/cloudinary/test', payload),
    save: (payload) => api.put('/cloudinary', payload),
    clear: () => api.delete('/cloudinary')
};