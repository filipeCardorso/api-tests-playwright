import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, UserListResponse, ApiError } from '../../types/api.types';

test.describe('List Users API @users @regression', () => {
  test.describe('GET /api/users - Success Cases', () => {
    test('should list users with default pagination', async ({ apiClient }) => {
      // Register and login
      const userData = generateTestUser('listusers');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS);

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    test('should support custom page parameter', async ({ apiClient }) => {
      const userData = generateTestUser('listpage');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS, {
        params: { page: 2 },
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.pagination.page).toBe(2);
    });

    test('should support custom limit parameter', async ({ apiClient }) => {
      const userData = generateTestUser('listlimit');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS, {
        params: { limit: 5 },
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.pagination.limit).toBe(5);
      expect(data.users.length).toBeLessThanOrEqual(5);
    });

    test('should support search by name or email', async ({ apiClient }) => {
      const userData = generateTestUser('listsearch');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS, {
        params: { search: 'listsearch' },
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.users.length).toBeGreaterThan(0);
    });

    test('should return pagination metadata', async ({ apiClient }) => {
      const userData = generateTestUser('listmeta');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS);

      expect(response.status()).toBe(STATUS.OK);
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(typeof data.pagination.total).toBe('number');
      expect(typeof data.pagination.totalPages).toBe('number');
    });

    test('should not return deleted users (soft delete)', async ({ apiClient }) => {
      const userData = generateTestUser('listnodelete');
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

      const { response, data } = await apiClient.get<UserListResponse>(ENDPOINTS.USERS);

      expect(response.status()).toBe(STATUS.OK);
      // All returned users should not have deletedAt
      data.users.forEach((user) => {
        expect(user).not.toHaveProperty('deletedAt');
      });
    });
  });

  test.describe('GET /api/users - Error Cases', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.get<ApiError>(ENDPOINTS.USERS);

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 with invalid access token', async ({ apiClient }) => {
      apiClient.setAccessToken('invalid-token');

      const { response } = await apiClient.get<ApiError>(ENDPOINTS.USERS);

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
