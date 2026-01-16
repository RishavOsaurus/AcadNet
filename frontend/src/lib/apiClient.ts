// src/lib/apiClient.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'https://acad-net.vercel.app/api/v1/',
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
  const csrfToken = Cookies.get('csrfToken');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;