import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, MESSAGES, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, MessageResponse, ApiError } from '../../types/api.types';

test.describe('Logout API @auth @regression', () => {
  test.describe('POST /api/auth/logout - Success Cases', () => {
    test('should logout successfully with valid tokens', async ({ apiClient }) => {
      // Register and login
      const userData = generateTestUser('logout');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      // Set access token for authenticated request
      apiClient.setAccessToken(loginResponse.data.accessToken);

      const { response, data } = await apiClient.post<MessageResponse>(ENDPOINTS.LOGOUT, {
        refreshToken: loginResponse.data.refreshToken,
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.message).toBe(MESSAGES.LOGOUT_SUCCESS);
    });

    test('should invalidate refresh token after logout', async ({ apiClient }) => {
      const userData = generateTestUser('logoutinvalidate');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      apiClient.setAccessToken(loginResponse.data.accessToken);
      const refreshToken = loginResponse.data.refreshToken;

      // Logout
      await apiClient.post<MessageResponse>(ENDPOINTS.LOGOUT, { refreshToken });

      // Try to use the refresh token after logout
      apiClient.clearAccessToken();
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.REFRESH, { refreshToken });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });

  test.describe('POST /api/auth/logout - Error Cases', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.LOGOUT, {
        refreshToken: '00000000-0000-0000-0000-000000000000',
      });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 400 when refresh token is missing', async ({ apiClient }) => {
      const userData = generateTestUser('logoutnotoken');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      apiClient.setAccessToken(loginResponse.data.accessToken);

      const { response } = await apiClient.post<ApiError>(ENDPOINTS.LOGOUT, {});

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });
  });
});
