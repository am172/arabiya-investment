import api from './axiosInstance';

export default {
    list: (params) => api.get('/catalog', { params }),
    tree: () => api.get('/catalog/tree'),
    get: (id) => api.get(`/catalog/${id}`),
    create: (payload) => api.post('/catalog', payload),
    update: (id, payload) => api.put(`/catalog/${id}`, payload),
    setFlags: (id, flags) => api.patch(`/catalog/${id}/flags`, flags),
    move: (id, parent, index) => api.patch(`/catalog/${id}/move`, { parent, index }),
    reorder: (parent, ids) => api.patch('/catalog/reorder', { parent, ids }),
    duplicate: (id, options) => api.post(`/catalog/${id}/duplicate`, options),
    remove: (id, strategy) => api.delete(`/catalog/${id}`, { params: strategy ? { strategy } : {} }),
    bulk: (payload) => api.post('/catalog/bulk', payload)
};