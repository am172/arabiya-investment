import api from './client';
import safe from './safe';

export const getStats = () => safe(() => api.get('/public/stats'), []);