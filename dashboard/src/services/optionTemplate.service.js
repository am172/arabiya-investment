import api from './axiosInstance';

export default {
    list: (params) => api.get('/option-templates', { params }),
    get: (id) => api.get(`/option-templates/${id}`),
    create: (payload) => api.post('/option-templates', payload),
    update: (id, payload) => api.put(`/option-templates/${id}`, payload),
    remove: (id) => api.delete(`/option-templates/${id}`)
};