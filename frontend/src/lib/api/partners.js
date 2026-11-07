import api from './client';
import safe from './safe';

export const getPartners = () => safe(() => api.get('/public/partners'), []);