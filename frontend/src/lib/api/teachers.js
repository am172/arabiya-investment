import api from './client';
import safe from './safe';

export const getTeachers = () =>
  safe(() => api.get('/public/teachers', { params: { limit: 12 } }), []);