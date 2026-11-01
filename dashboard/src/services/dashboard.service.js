import api from './axiosInstance';

export default {
  overview: () => api.get('/dashboard/overview')
};