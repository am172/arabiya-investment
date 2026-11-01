import api from './axiosInstance';

export default {
  list: (params) => api.get('/messages', { params }),
  get: (id) => api.get(`/messages/${id}`),
  unreadCount: () => api.get('/messages/unread-count'),
  updateStatus: (id, status) => api.patch(`/messages/${id}/status`, { status }),
  markAllRead: () => api.patch('/messages/mark-all-read'),
  remove: (id) => api.delete(`/messages/${id}`),
  bulkDelete: (ids) => api.post('/messages/bulk-delete', { ids })
};