import api from './client';

export const getCertificate = async (code) => {
  try {
    const res = await api.get(`/public/certificates/${encodeURIComponent(code)}`);
    return { state: 'found', data: res.data };
  } catch (error) {
    return { state: error.status === 404 ? 'missing' : 'error' };
  }
};