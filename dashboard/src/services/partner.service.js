import api from './axiosInstance';

export default {
    list: () => api.get('/partners'),
    create: (payload) => api.post('/partners', payload),
    update: (id, payload) => api.put(`/partners/${id}`, payload),
    remove: (id) => api.delete(`/partners/${id}`),
    reorder: (ids) => api.patch('/partners/reorder', { ids })
};