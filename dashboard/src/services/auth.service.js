import api from './axiosInstance';

export default {
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  changePassword: (payload) => api.patch('/auth/change-password', payload)
};