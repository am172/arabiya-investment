import api from './axiosInstance';

export default {
  get: () => api.get('/currencies'),
  update: (payload) => api.put('/currencies', payload),
  refresh: () => api.post('/currencies/refresh')
};