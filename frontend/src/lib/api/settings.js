import { cache } from 'react';
import api from './client';
import safe from './safe';

export const getSettings = cache(() => safe(() => api.get('/public/settings'), null));