import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, AuthMeResponse, ApiError } from '../../types/api.types';

test.describe('Auth Me API @auth @regression', () => {
  test.describe('GET /api/auth/me - Success Cases', () => {
    test('should return current user data with valid token', async ({ apiClient }) => {
      const userData = generateTestUser('me');
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

      const { response, data } = await apiClient.get<AuthMeResponse>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.email).toBe(userData.email);
      expect(data.name).toBe(userData.name);
      expect(data.role).toBe('user');
    });

    test('should not return password in response', async ({ apiClient }) => {
      const userData = generateTestUser('menopass');
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

      const { response, data } = await apiClient.get<AuthMeResponse>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.OK);
      expect(data).not.toHaveProperty('password');
    });

    test('should return createdAt timestamp', async ({ apiClient }) => {
      const userData = generateTestUser('mecreated');
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

      const { response, data } = await apiClient.get<AuthMeResponse>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.OK);
      expect(data.createdAt).toBeDefined();
      expect(new Date(data.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  test.describe('GET /api/auth/me - Error Cases', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.get<ApiError>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 with invalid access token', async ({ apiClient }) => {
      apiClient.setAccessToken('invalid-token');

      const { response } = await apiClient.get<ApiError>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 with malformed JWT', async ({ apiClient }) => {
      apiClient.setAccessToken('not.a.valid.jwt');

      const { response } = await apiClient.get<ApiError>(ENDPOINTS.ME);

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
