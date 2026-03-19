import axios from 'axios';
import { tokenManager } from './tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly refresh cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  for (const cookie of document.cookie.split('; ')) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
};

// Attach access token from memory
api.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (typeof window !== 'undefined') {
    const locale = getCookie('NEXT_LOCALE');
    if (locale) config.headers['x-lang'] = locale.slice(0, 2);
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => {
    // Unwrap { success, data, message } envelope
    const payload = response.data as any;
    if (payload && typeof payload === 'object' && payload.success === true && 'data' in payload) {
      const inner = payload.data;
      if (Array.isArray(inner)) {
        response.data = inner;
      } else if (inner && typeof inner === 'object') {
        response.data = { ...inner, message: payload.message };
      } else {
        response.data = { data: inner, message: payload.message };
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/refresh-token'
    ) {
      original._retry = true;
      try {
        // Cookie is sent automatically (withCredentials: true)
        const { data } = await api.post<{ accessToken: string }>('/auth/refresh-token');
        tokenManager.set(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        tokenManager.clear();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && original._retry) {
      tokenManager.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
