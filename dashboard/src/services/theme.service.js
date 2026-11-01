import api from './axiosInstance';

export default {
  update: (payload) => api.patch('/settings/theme', payload),
  reset: () => api.post('/settings/theme/reset')
};