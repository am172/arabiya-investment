import api from './client';
import safe from './safe';

export const getBranches = () => safe(() => api.get('/public/branches'), []);