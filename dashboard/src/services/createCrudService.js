import api from './axiosInstance';

export default function createCrudService(path) {
  return {
    list: (params) => api.get(path, { params }),
    get: (id) => api.get(`${path}/${id}`),
    create: (payload) => api.post(path, payload),
    update: (id, payload) => api.put(`${path}/${id}`, payload),
    remove: (id) => api.delete(`${path}/${id}`),
    toggleStatus: (id) => api.patch(`${path}/${id}/toggle-status`),
    reorder: (items) => api.patch(`${path}/reorder`, { items })
  };
}