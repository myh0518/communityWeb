import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 요청마다 토큰 자동으로 붙이기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;