import api from './axiosInstance';

const send = (type, file, folder, onProgress) => {
  const form = new FormData();
  form.append('folder', folder);
  form.append('file', file);

  return api.post(`/uploads/${type}`, form, {
    timeout: 0,
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded * 100) / event.total));
    }
  });
};

export default {
  uploadDocument: (file, folder = 'documents', onProgress) => send('document', file, folder, onProgress),
  uploadImage: (file, folder = 'general', onProgress) => send('image', file, folder, onProgress),
  uploadVideo: (file, folder = 'videos', onProgress) => send('video', file, folder, onProgress),
  remove: (publicId, resourceType = 'image') =>
    api.delete('/uploads', { params: { publicId, resourceType } })
};