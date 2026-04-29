'use client';

import axios from 'axios';
import { useAuthStore } from '@/store/useStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMy: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// AI
export const aiAPI = {
  getRecommendations: (params = {}) => api.get('/ai/recommendations', { params }),
  trackActivity: (data) => api.post('/ai/track', data),
  getMySignals: () => api.get('/ai/my-signals'),
};

// Public platform stats
export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  getIds: () => api.get('/wishlist/ids'),
  toggle: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  readAll: () => api.put('/notifications/read-all'),
  readOne: (id) => api.put(`/notifications/${id}/read`),
  deleteOne: (id) => api.delete(`/notifications/${id}`),
};

// Discounts (public — user checkout)
export const discountAPI = {
  validate: (data) => api.post('/discounts/validate', data),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAIAnalysis: () => api.get('/admin/dashboard/ai-analysis'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) =>
    api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) =>
    api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleBlockUser: (id) => api.patch(`/admin/users/${id}/toggle-block`),
  getDiscounts: () => api.get('/admin/discounts'),
  createDiscount: (data) => api.post('/admin/discounts', data),
  updateDiscount: (id, data) => api.put(`/admin/discounts/${id}`, data),
  deleteDiscount: (id) => api.delete(`/admin/discounts/${id}`),
  toggleDiscount: (id) => api.patch(`/admin/discounts/${id}/toggle`),
  getMarketingLogs: (params) => api.get('/admin/marketing/logs', { params }),
  triggerMarketing: (campaignType) => api.post('/admin/marketing/trigger', { campaignType }),
  getAlerts: () => api.get('/admin/alerts'),
};

export default api;
