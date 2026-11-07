import api from './axiosInstance';

export default {
    list: () => api.get('/branches'),
    create: (payload) => api.post('/branches', payload),
    update: (id, payload) => api.put(`/branches/${id}`, payload),
    remove: (id) => api.delete(`/branches/${id}`),
    reorder: (ids) => api.patch('/branches/reorder', { ids })
};