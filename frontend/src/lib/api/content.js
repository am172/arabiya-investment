import { cache } from 'react';
import api from './client';
import safe from './safe';

export const getContent = cache(() => safe(() => api.get('/public/content'), null));