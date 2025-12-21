// ============================================================
// User Types
// ============================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

// ============================================================
// Auth Types
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthMeResponse extends User {}

// ============================================================
// Health Types
// ============================================================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  responseTime: string;
  checks: {
    database: {
      status: 'connected' | 'disconnected';
      latency: string;
      error: string | null;
    };
  };
  system: {
    memory: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
    };
    nodeVersion: string;
  };
}

export interface ApiVersionResponse {
  version: string;
  status: string;
  documentation: string;
  endpoints?: {
    auth: Record<string, string>;
    users: Record<string, string>;
    admin: Record<string, string>;
    system: Record<string, string>;
  };
}

// ============================================================
// Common Types
// ============================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface MessageResponse {
  message: string;
}

// ============================================================
// Test Context Types
// ============================================================

export interface TestUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthContext {
  user: TestUser;
  accessToken: string;
  refreshToken: string;
}
