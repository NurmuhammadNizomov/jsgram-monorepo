// Final types aligned 1:1 with backend DTOs and models

// ============ USER RELATED TYPES ============

export interface User {
  _id: string; // MongoDB ObjectId
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  bio?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string | null;
  roles: string[];
  language: 'en' | 'uz' | 'ru';
  devices: string[];
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

// ============ DEVICE RELATED TYPES ============

export interface DeviceLocation {
  country?: string;
  city?: string;
  timezone?: string;
}

export interface Device {
  _id: string;
  userId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  browser: string;
  userAgent: string;
  ipAddress: string;
  isTrusted: boolean;
  isActive: boolean;
  lastUsedAt: string;
  location?: DeviceLocation | null;
  createdAt: string;
  updatedAt: string;
}

// ============ AUTHENTICATION REQUEST TYPES (1:1 with backend DTOs) ============

export interface LoginRequest {
  email: string; // @IsEmail
  password: string; // @IsString, @MinLength(6)
  rememberMe?: boolean; // @IsOptional, @IsBoolean
}

export interface RegisterRequest {
  email: string; // @IsEmail
  password: string; // @IsString, @MinLength(6)
  bio?: string; // @IsOptional, @IsString
  username?: string; // optional, generated if omitted
  firstName?: string; // optional
  lastName?: string;  // optional
  language?: 'en' | 'uz' | 'ru'; // @IsOptional, @IsString
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ============ AUTHENTICATION RESPONSE TYPES ============

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  isNewDevice?: boolean;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RemoveDeviceResponse {
  message: string;
}

// ============ AUTHENTICATION CONTEXT TYPES ============

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============ FORM DATA TYPES ============

export interface LoginFormData extends LoginRequest {}

export interface RegisterFormData extends RegisterRequest {}

export interface VerifyEmailFormData extends VerifyEmailRequest {}

export interface ForgotPasswordFormData extends ForgotPasswordRequest {}

export interface ResetPasswordFormData extends ResetPasswordRequest {}

// ============ VALIDATION RULES (from backend) ============

export interface ValidationRules {
  username: {
    minLength: 3;
    maxLength: 30;
    pattern: RegExp;
  };
  password: {
    minLength: 6;
  };
  bio: {
    maxLength: 500;
  };
}

export const validationRules: ValidationRules = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    minLength: 6
  },
  bio: {
    maxLength: 500
  }
};
