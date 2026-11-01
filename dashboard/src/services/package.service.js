import api from './axiosInstance';
import createCrudService from './createCrudService';

export default {
  ...createCrudService('/packages'),
  setPopular: (id) => api.patch(`/packages/${id}/set-popular`)
};