import { api } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse,
  Device,
  RemoveDeviceResponse
} from '../types/auth';

export class AuthAPI {
  // Register user
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  // Login user
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  // Verify email
  static async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
    return response.data;
  }

  // Refresh access token — no body, uses httpOnly cookie
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token');
    return response.data;
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  }

  // Reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  }

  // Logout
  static async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response.data;
  }

  // Logout from all devices
  static async logoutAll(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/auth/logout-all');
    return response.data;
  }

  // Get user devices
  static async getDevices(): Promise<Device[]> {
    const response = await api.get<Device[]>('/auth/devices');
    return response.data;
  }

  // Remove device
  static async removeDevice(deviceId: string): Promise<RemoveDeviceResponse> {
    const response = await api.post<RemoveDeviceResponse>(`/auth/devices/${deviceId}/remove`);
    return response.data;
  }
}

export default AuthAPI;
