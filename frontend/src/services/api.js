import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
export const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
  changePassword: (userId, data) => api.put(`/auth/profile/${userId}/password`, data),
};

// Products API
export const productsAPI = {
  getAll: (search, category) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    return api.get(`/products?${params.toString()}`);
  },
  getCategories: () => api.get('/products/categories'),
  getOne: (id) => api.get(`/products/${id}`),
  rateProduct: (id, rating, userId, review) => api.post(`/products/${id}/rate`, { rating, userId, review }),
  canRate: (productId, userId) => api.get(`/products/${productId}/can-rate?userId=${userId}`),
  getReviews: (productId, ratingFilter) => {
    const params = ratingFilter ? `?rating=${ratingFilter}` : '';
    return api.get(`/products/${productId}/reviews${params}`);
  },
  getRatingBreakdown: (productId) => api.get(`/products/${productId}/rating-breakdown`),
  create: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: (userId) => api.get(`/cart?user_id=${userId}`),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getUserOrders: (userId) => api.get(`/orders?user_id=${userId}`),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  // Admin
  getAllOrders: () => api.get('/admin/orders'),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getAnalytics: () => api.get('/admin/orders/analytics'),
};

export default api;
