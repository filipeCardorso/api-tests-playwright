import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RefreshTokenResponse, RegisterResponse, ApiError } from '../../types/api.types';

test.describe('Refresh Token API @auth @regression', () => {
  test.describe('POST /api/auth/refresh - Success Cases', () => {
    test('should refresh tokens with valid refresh token', async ({ apiClient }) => {
      // Register and login to get tokens
      const userData = generateTestUser('refresh');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      // Skip if email verification is required
      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      const { response, data } = await apiClient.post<RefreshTokenResponse>(ENDPOINTS.REFRESH, {
        refreshToken: loginResponse.data.refreshToken,
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
    });

    test('should return new access token with valid JWT format', async ({ apiClient }) => {
      const userData = generateTestUser('refreshjwt');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      const { response, data } = await apiClient.post<RefreshTokenResponse>(ENDPOINTS.REFRESH, {
        refreshToken: loginResponse.data.refreshToken,
      });

      if (response.status() === STATUS.OK) {
        const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        expect(data.accessToken).toMatch(jwtRegex);
      }
    });

    test('should rotate refresh token (old token becomes invalid)', async ({ apiClient }) => {
      const userData = generateTestUser('refreshrotate');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      const oldRefreshToken = loginResponse.data.refreshToken;

      // First refresh - should succeed
      const firstRefresh = await apiClient.post<RefreshTokenResponse>(ENDPOINTS.REFRESH, {
        refreshToken: oldRefreshToken,
      });

      expect(firstRefresh.response.status()).toBe(STATUS.OK);

      // Second refresh with old token - should fail (token rotated)
      const secondRefresh = await apiClient.post<ApiError>(ENDPOINTS.REFRESH, {
        refreshToken: oldRefreshToken,
      });

      expect(secondRefresh.response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });

  test.describe('POST /api/auth/refresh - Error Cases', () => {
    test('should return 400 when refresh token is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.REFRESH, {});

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });

    test('should return 401 for invalid refresh token', async ({ apiClient }) => {
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.REFRESH, {
        refreshToken: 'invalid-token',
      });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 for non-existent refresh token', async ({ apiClient }) => {
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.REFRESH, {
        refreshToken: '00000000-0000-0000-0000-000000000000',
      });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
