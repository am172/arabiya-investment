import api from './axiosInstance';

export default {
  list: (params) => api.get('/certificates', { params }),
  create: (payload) => api.post('/certificates', payload),
  update: (id, payload) => api.patch(`/certificates/${id}`, payload),
  revoke: (id, payload) => api.patch(`/certificates/${id}/revoke`, payload),
  remove: (id) => api.delete(`/certificates/${id}`),
  getSettings: () => api.get('/certificates/settings'),
  updateSettings: (payload) => api.put('/certificates/settings', payload),
  sendWhatsApp: (id, blob, phone, filename) => {
    const form = new FormData();
    form.append('phone', phone);
    form.append('file', blob, filename);
    return api.post(`/certificates/${id}/send-whatsapp`, form, { timeout: 60000 });
  }
};