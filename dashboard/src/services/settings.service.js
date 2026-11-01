import api from './axiosInstance';

export default {
  get: () => api.get('/settings'),
  update: (payload) => api.patch('/settings', payload)
};