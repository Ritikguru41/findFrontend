import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  // Uses VITE_API_URL from .env (local) or Vercel env vars (production)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 20000, // 20s timeout (Render free tier can be slow on cold starts)
});

// ── Request interceptor — attach JWT token ─────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('findseat_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// ── Response interceptor — handle global errors ────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear session and redirect
      localStorage.removeItem('findseat_token');
      localStorage.removeItem('findseat_user');
      toast.error('Session expired. Please log in again.');
      // Small delay so toast is visible before redirect
      setTimeout(() => { window.location.href = '/login'; }, 1000);
    } else if (err.code === 'ECONNABORTED') {
      toast.error('Request timed out. The server may be starting up, please try again.');
    } else if (!err.response) {
      toast.error('Cannot connect to server. Please check your internet connection.');
    }
    return Promise.reject(err);
  }
);

export default api;
