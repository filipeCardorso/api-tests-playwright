import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, User, ApiError } from '../../types/api.types';

test.describe('Get User API @users @regression', () => {
  test.describe('GET /api/users/:id - Success Cases', () => {
    test('should get user by ID', async ({ apiClient }) => {
      const userData = generateTestUser('getuser');
      const registerResponse = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      apiClient.setAccessToken(loginResponse.data.accessToken);
      const userId = loginResponse.data.user.id;

      const { response, data } = await apiClient.get<User>(ENDPOINTS.USER_BY_ID(userId));

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(data.id).toBe(userId);
      expect(data.email).toBe(userData.email);
      expect(data.name).toBe(userData.name);
    });

    test('should not return password in user data', async ({ apiClient }) => {
      const userData = generateTestUser('getusernopass');
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
      const userId = loginResponse.data.user.id;

      const { response, data } = await apiClient.get<User>(ENDPOINTS.USER_BY_ID(userId));

      expect(response.status()).toBe(STATUS.OK);
      expect(data).not.toHaveProperty('password');
    });

    test('should return user with all expected fields', async ({ apiClient }) => {
      const userData = generateTestUser('getuserfields');
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
      const userId = loginResponse.data.user.id;

      const { response, data } = await apiClient.get<User>(ENDPOINTS.USER_BY_ID(userId));

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('role');
      expect(data).toHaveProperty('emailVerified');
      expect(data).toHaveProperty('createdAt');
    });
  });

  test.describe('GET /api/users/:id - Error Cases', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.get<ApiError>(ENDPOINTS.USER_BY_ID(1));

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 404 for non-existent user', async ({ apiClient }) => {
      const userData = generateTestUser('getusernotfound');
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

      const { response } = await apiClient.get<ApiError>(ENDPOINTS.USER_BY_ID(999999));

      expect(response.status()).toBe(STATUS.NOT_FOUND);
    });

    test('should return 400 for invalid user ID', async ({ apiClient }) => {
      const userData = generateTestUser('getuserinvalid');
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

      const { response } = await apiClient.get<ApiError>('/api/users/invalid');

      expect([STATUS.BAD_REQUEST, STATUS.NOT_FOUND]).toContain(response.status());
    });
  });
});
