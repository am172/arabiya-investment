import api from './axiosInstance';
import createCrudService from './createCrudService';

export default {
  ...createCrudService('/videos'),
  toggleFeatured: (id) => api.patch(`/videos/${id}/toggle-featured`)
};