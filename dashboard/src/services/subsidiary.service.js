import axiosInstance from './axiosInstance';

const BASE_URL = '/subsidiaries';

const subsidiaryService = {
    getAll: async (params = {}) => {
        const response = await axiosInstance.get(BASE_URL, { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axiosInstance.post(BASE_URL, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    remove: async (id) => {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    toggleStatus: async (id) => {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}/toggle-status`);
        return response.data;
    },

    reorder: async (items) => {
        const response = await axiosInstance.patch(`${BASE_URL}/reorder`, { items });
        return response.data;
    }
};

export default subsidiaryService;