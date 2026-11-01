import api from './axiosInstance';
import createCrudService from './createCrudService';

export default {
  ...createCrudService('/admins'),
  resetPassword: (id, newPassword) => api.patch(`/admins/${id}/reset-password`, { newPassword })
};