"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthAPI from '../lib/auth';
import { api } from '../lib/api';
import type { User, RegisterRequest, RegisterResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const saveTokens = (tokens: { accessToken: string; refreshToken: string; sessionId: string }) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('sessionId', tokens.sessionId);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.login({ email, password, rememberMe });
      saveTokens(response.tokens);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      return await AuthAPI.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch {
      // token muddati tugagan bo'lsa ham local state tozalansin
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await AuthAPI.logoutAll();
    } catch {
      // ignore
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // Serverdagi haqiqiy ma'lumotni oladi
  const refreshUser = async () => {
    try {
      const response = await api.get<User>('/users/profile');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  // App ochilganda tokenni server orqali verify qiladi
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
