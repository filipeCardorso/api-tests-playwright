import { ApiClient } from './api-client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  AuthMeResponse,
  TestUser,
  AuthContext,
} from '../types/api.types';

/**
 * Authentication helper for managing user authentication in tests
 */
export class AuthHelper {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<{ success: boolean; data: RegisterResponse | null; error?: string }> {
    try {
      const { response, data } = await this.apiClient.post<RegisterResponse>('/api/auth/register', userData);

      if (response.ok()) {
        return { success: true, data };
      }

      return { success: false, data: null, error: data?.message || 'Registration failed' };
    } catch (error) {
      return { success: false, data: null, error: String(error) };
    }
  }

  /**
   * Login with credentials and return auth context
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; context: AuthContext | null; error?: string }> {
    try {
      const { response, data } = await this.apiClient.post<LoginResponse>('/api/auth/login', credentials);

      if (response.ok() && data) {
        this.apiClient.setAccessToken(data.accessToken);

        const context: AuthContext = {
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            password: credentials.password,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };

        return { success: true, context };
      }

      return { success: false, context: null, error: data?.message || 'Login failed' };
    } catch (error) {
      return { success: false, context: null, error: String(error) };
    }
  }

  /**
   * Logout the current user
   */
  async logout(refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { response } = await this.apiClient.post('/api/auth/logout', { refreshToken });

      this.apiClient.clearAccessToken();

      if (response.ok()) {
        return { success: true };
      }

      return { success: false, error: 'Logout failed' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<{ success: boolean; data: RefreshTokenResponse | null; error?: string }> {
    try {
      const { response, data } = await this.apiClient.post<RefreshTokenResponse>('/api/auth/refresh', { refreshToken });

      if (response.ok() && data) {
        this.apiClient.setAccessToken(data.accessToken);
        return { success: true, data };
      }

      return { success: false, data: null, error: 'Token refresh failed' };
    } catch (error) {
      return { success: false, data: null, error: String(error) };
    }
  }

  /**
   * Get current authenticated user info
   */
  async me(): Promise<{ success: boolean; data: AuthMeResponse | null; error?: string }> {
    try {
      const { response, data } = await this.apiClient.get<AuthMeResponse>('/api/auth/me');

      if (response.ok() && data) {
        return { success: true, data };
      }

      return { success: false, data: null, error: 'Failed to get user info' };
    } catch (error) {
      return { success: false, data: null, error: String(error) };
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { response } = await this.apiClient.post('/api/auth/forgot-password', { email });

      if (response.ok()) {
        return { success: true };
      }

      return { success: false, error: 'Failed to request password reset' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Create a test user with unique email and login
   */
  async createAndLoginTestUser(prefix: string = 'test'): Promise<AuthContext | null> {
    const timestamp = Date.now();
    const userData: RegisterRequest = {
      name: `${prefix} User ${timestamp}`,
      email: `${prefix}.${timestamp}@test.com`,
      password: 'Test123456',
    };

    const registerResult = await this.register(userData);
    if (!registerResult.success) {
      console.error('Failed to register test user:', registerResult.error);
      return null;
    }

    // Note: In a real scenario, you'd need to verify email first
    // For testing, you might have a way to bypass email verification

    const loginResult = await this.login({
      email: userData.email,
      password: userData.password,
    });

    return loginResult.context;
  }
}
