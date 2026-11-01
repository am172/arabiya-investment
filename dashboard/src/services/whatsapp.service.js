import api from './axiosInstance';

export default {
    status: () => api.get('/whatsapp/status'),
    connect: (payload) => api.post('/whatsapp/connect', payload),
    disconnect: () => api.post('/whatsapp/disconnect'),
    getSettings: () => api.get('/whatsapp/settings'),
    updateSettings: (payload) => api.put('/whatsapp/settings', payload),
    preview: (payload) => api.post('/whatsapp/preview', payload),
    list: (params) => api.get('/whatsapp/chats', { params }),
    resume: (id) => api.patch(`/whatsapp/chats/${id}/resume`),
    remove: (id) => api.delete(`/whatsapp/chats/${id}`)
};