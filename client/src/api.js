import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://emenu-alpha.vercel.app/api';
const api = axios.create({ baseURL: API_BASE });

// 请求拦截：自动携带 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：401 自动跳转登录
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── 分类 ─────────────────────────────────────────────
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ── 菜品 ─────────────────────────────────────────────
export const getDishes = (params) => api.get('/dishes', { params });
export const getMyDishes = (params) => api.get('/dishes/my', { params });
export const getDish = (id) => api.get(`/dishes/${id}`);
export const createDish = (formData) =>
  api.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDish = (id, formData) =>
  api.put(`/dishes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDish = (id) => api.delete(`/dishes/${id}`);

// ── 用户 ─────────────────────────────────────────────
export const login = (data) => api.post('/users/login', data);
export const getMe = () => api.get('/users/me');
export const changeMyPassword = (data) => api.put('/users/me/password', data);
export const updateMyProfile = (formData) =>
  api.put('/users/me/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
