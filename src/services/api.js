import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.post(`/users/${id}/change-password`, data),
};

// ─── Roles ───────────────────────────────────────────────────────────────────
export const rolesAPI = {
  getAll: () => api.get('/roles/'),
};

// ─── Menus ───────────────────────────────────────────────────────────────────
export const menusAPI = {
  getAll: () => api.get('/menus/'),
  getById: (id) => api.get(`/menus/${id}`),
  create: (data) => api.post('/menus/', data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  delete: (id) => api.delete(`/menus/${id}`),
  uploadPoster: (menuId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/menus/${menuId}/posters/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePoster: (posterId) => api.delete(`/menus/posters/${posterId}`),
};

// ─── Food Packages ───────────────────────────────────────────────────────────
export const foodPackagesAPI = {
  getAll: () => api.get('/food-packages/'),
  getById: (id) => api.get(`/food-packages/${id}`),
  create: (data) => api.post('/food-packages/', data),
  update: (id, data) => api.put(`/food-packages/${id}`, data),
  delete: (id) => api.delete(`/food-packages/${id}`),
};

// ─── Booking Sessions ────────────────────────────────────────────────────────
export const bookingSessionsAPI = {
  getAll: () => api.get('/booking-sessions/'),
  getById: (id) => api.get(`/booking-sessions/${id}`),
  create: (data) => api.post('/booking-sessions/', data),
  update: (id, data) => api.put(`/booking-sessions/${id}`, data),
  delete: (id) => api.delete(`/booking-sessions/${id}`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  getAll: () => api.get('/bookings/'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings/', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByStatus: (status) => api.get(`/bookings/status/${status}`),
};

export default api;
