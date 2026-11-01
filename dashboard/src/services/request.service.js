import api from './axiosInstance';

export default {
    list: (params) => api.get('/requests', { params }),
    get: (id) => api.get(`/requests/${id}`),
    stats: () => api.get('/requests/stats'),
    unreadCount: () => api.get('/requests/unread-count'),
    updateStatus: (id, payload) => api.patch(`/requests/${id}/status`, payload),
    updateNote: (id, adminNote) => api.patch(`/requests/${id}/note`, { adminNote }),
    remove: (id) => api.delete(`/requests/${id}`),
    bulkRemove: (ids) => api.post('/requests/bulk-delete', { ids }),
    exportCsv: (params) => api.get('/requests/export', { params, responseType: 'blob' })
};