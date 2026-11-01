import api from './client';
import safe from './safe';

export const getTestimonials = () =>
    safe(() => api.get('/public/testimonials', { params: { limit: 30 } }), []);