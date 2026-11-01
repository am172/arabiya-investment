import api from './client';
import safe from './safe';

export const getPackages = () => safe(() => api.get('/public/packages'), []);