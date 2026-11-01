import { cache } from 'react';
import api from './client';
import safe from './safe';

export const getTexts = cache(() => safe(() => api.get('/public/texts'), {}));