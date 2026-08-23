import axios from 'axios';
import { getToken, limpiarSesion } from '../auth/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://TU-BACKEND-URL.onrender.com/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      limpiarSesion();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
