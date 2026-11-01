import axios from 'axios';
import { API_URL } from '../constants/config';
import { getToken, removeToken } from '../utils/storage';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : 0;
    const body = error.response ? error.response.data : null;
    const url = error.config && error.config.url ? error.config.url : '';

    if (status === 401 && !url.includes('/auth/login')) {
      removeToken();
      window.dispatchEvent(new Event('auth:logout'));
    }

    const normalized = new Error(
      (body && body.message) || (status === 0 ? 'Cannot reach the server' : error.message)
    );
    normalized.status = status;
    normalized.errors = (body && body.errors) || [];
    return Promise.reject(normalized);
  }
);

export default api;