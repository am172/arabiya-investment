import api from './client';
import safe from './safe';

export const getVideos = () => safe(() => api.get('/public/videos', { params: { limit: 9 } }), []);

export const getAllVideos = () => safe(() => api.get('/public/videos', { params: { limit: 50 } }), []);