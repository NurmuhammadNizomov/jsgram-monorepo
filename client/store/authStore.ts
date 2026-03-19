import { create } from 'zustand';
import { api } from '@/lib/api';
import { tokenManager } from '@/lib/tokenManager';
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  /** Called once on app start — tries to get a new access token via httpOnly cookie */
  initialize: async () => {
    if (typeof window === 'undefined') return;
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh-token');
      tokenManager.set(data.accessToken);
      const profile = await api.get<User>('/users/profile');
      set({ user: profile.data, isInitialized: true });
    } catch {
      tokenManager.clear();
      set({ user: null, isInitialized: true });
    }
  },

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', {
        email, password, rememberMe,
      });
      tokenManager.set(data.accessToken);
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (body) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<RegisterResponse>('/auth/register', body);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* cookie cleared by server anyway */ }
    tokenManager.clear();
    set({ user: null });
  },

  logoutAll: async () => {
    try { await api.post('/auth/logout-all'); } catch {}
    tokenManager.clear();
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get<User>('/users/profile');
      set({ user: data });
    } catch {
      tokenManager.clear();
      set({ user: null });
    }
  },
}));
