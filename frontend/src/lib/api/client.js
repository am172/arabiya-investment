import axios from 'axios';

const baseURL =
  (typeof window === 'undefined'
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' }
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : 0;
    const body = error.response ? error.response.data : null;
    const normalized = new Error(
      (body && body.message) ||
        (status === 0 ? 'Cannot reach the server. Please try again.' : error.message)
    );
    normalized.status = status;
    normalized.errors = (body && body.errors) || [];
    return Promise.reject(normalized);
  }
);

export default api;