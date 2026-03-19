import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Access tokenni olish
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Backend i18n uchun til header
      const locale = getCookie('NEXT_LOCALE');
      if (locale) {
        config.headers['x-lang'] = locale.slice(0, 2);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
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
    const originalRequest = error.config;

    // 401 error va refresh token mavjud bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await api.post('/auth/refresh-token', { refreshToken });

            const { accessToken } = response.data as { accessToken: string };
            localStorage.setItem('accessToken', accessToken);

            // Asl so'rovni qayta yuborish
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token ham ishlamasa, logout qilish
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Boshqa 401 errorlar uchun logout
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
