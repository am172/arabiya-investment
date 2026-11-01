import { cache } from 'react';
import api from './client';
import safe from './safe';

export const getLegal = cache((slug) => safe(() => api.get(`/public/legal/${slug}`), null));