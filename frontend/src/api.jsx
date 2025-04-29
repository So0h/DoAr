import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // <-- your backend URL, adjust if needed
});

// Auth APIs
export const login = (data) => api.post('/auth/login/', data);
export const register = (data) => api.post('/auth/register/', data);

// Model APIs
export const uploadModel = (formData, token) =>
  api.post('/model/upload', formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchModels = (token) =>
  api.get('/model/list', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteModel = (id, token) =>
  api.delete(`/model/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const renameModel = (id, newName, token) =>
  api.put(`/model/${id}/rename`, { newName }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;
