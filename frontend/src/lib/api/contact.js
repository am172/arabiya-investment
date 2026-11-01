import api from './client';

export const sendContactMessage = (payload) => api.post('/public/contact', payload);