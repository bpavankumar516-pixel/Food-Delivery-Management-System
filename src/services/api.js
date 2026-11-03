import axios from 'axios';

// Base API instance configured for Foodix
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject stored auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. Session may be expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
