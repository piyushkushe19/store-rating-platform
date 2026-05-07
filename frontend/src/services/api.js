import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createUser: (data) => api.post('/admin/users', data),
  createStore: (data) => api.post('/admin/stores', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  getStores: (params) => api.get('/admin/stores', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  getAvailableOwners: () => api.get('/admin/store-owners/available'),
};

// Stores (user)
export const storesAPI = {
  getAll: (params) => api.get('/stores', { params }),
  search: (params) => api.get('/stores/search', { params }),
};

// Ratings
export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  update: (id, data) => api.put(`/ratings/${id}`, data),
};

// Owner
export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
  getRatings: () => api.get('/owner/ratings'),
};

export default api;
