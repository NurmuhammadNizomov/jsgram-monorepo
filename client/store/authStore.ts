import { create } from 'zustand';
import AuthAPI from '@/lib/auth';
import { api } from '@/lib/api';
import type { User, RegisterRequest, RegisterResponse } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionId');
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const { data } = await api.get<User>('/users/profile');
      set({ user: data, isInitialized: true });
    } catch {
      clearTokens();
      set({ user: null, isInitialized: true });
    }
  },

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const response = await AuthAPI.login({ email, password, rememberMe });
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('sessionId', response.tokens.sessionId);
      set({ user: response.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      return await AuthAPI.register(data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try { await AuthAPI.logout(); } catch { /* token expired — still clear locally */ }
    clearTokens();
    set({ user: null });
  },

  logoutAll: async () => {
    try { await AuthAPI.logoutAll(); } catch {}
    clearTokens();
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get<User>('/users/profile');
      set({ user: data });
    } catch {
      clearTokens();
      set({ user: null });
    }
  },
}));
