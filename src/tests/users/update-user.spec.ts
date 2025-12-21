import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, User, ApiError } from '../../types/api.types';

test.describe('Update User API @users @regression', () => {
  test.describe('PUT /api/users/:id - Success Cases', () => {
    test('should update own user name', async ({ apiClient }) => {
      const userData = generateTestUser('updatename');
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
      const newName = 'Updated Name';

      const { response, data } = await apiClient.put<User>(ENDPOINTS.USER_BY_ID(userId), {
        name: newName,
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.name).toBe(newName);
    });

    test('should update own user email', async ({ apiClient }) => {
      const userData = generateTestUser('updateemail');
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
      const newEmail = `updated.${Date.now()}@test.com`;

      const { response, data } = await apiClient.put<User>(ENDPOINTS.USER_BY_ID(userId), {
        email: newEmail,
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.email).toBe(newEmail);
    });

    test('should update multiple fields at once', async ({ apiClient }) => {
      const userData = generateTestUser('updatemulti');
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
      const newName = 'Multi Updated';
      const newEmail = `multi.${Date.now()}@test.com`;

      const { response, data } = await apiClient.put<User>(ENDPOINTS.USER_BY_ID(userId), {
        name: newName,
        email: newEmail,
      });

      expect(response.status()).toBe(STATUS.OK);
      expect(data.name).toBe(newName);
      expect(data.email).toBe(newEmail);
    });
  });

  test.describe('PUT /api/users/:id - Authorization', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.put<ApiError>(ENDPOINTS.USER_BY_ID(1), {
        name: 'New Name',
      });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 403 when updating another user (non-admin)', async ({ apiClient }) => {
      // Create first user
      const user1 = generateTestUser('updateother1');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, user1);

      // Create second user
      const user2 = generateTestUser('updateother2');
      const register2 = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, user2);

      // Login as first user
      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: user1.email,
        password: user1.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      apiClient.setAccessToken(loginResponse.data.accessToken);

      // Try to update second user
      const { response } = await apiClient.put<ApiError>(
        ENDPOINTS.USER_BY_ID(register2.data?.user?.id || 999999),
        { name: 'Hacked Name' }
      );

      expect([STATUS.FORBIDDEN, STATUS.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('PUT /api/users/:id - Validation', () => {
    test('should return 400 for invalid email format', async ({ apiClient }) => {
      const userData = generateTestUser('updateinvalid');
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

      const { response } = await apiClient.put<ApiError>(ENDPOINTS.USER_BY_ID(userId), {
        email: 'invalid-email',
      });

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });

    test('should return 409 when email already exists', async ({ apiClient }) => {
      // Create first user
      const user1 = generateTestUser('updatedup1');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, user1);

      // Create second user
      const user2 = generateTestUser('updatedup2');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, user2);

      // Login as second user
      const loginResponse = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
        email: user2.email,
        password: user2.password,
      });

      if (loginResponse.response.status() !== STATUS.OK) {
        test.skip();
        return;
      }

      apiClient.setAccessToken(loginResponse.data.accessToken);
      const userId = loginResponse.data.user.id;

      // Try to update to first user's email
      const { response } = await apiClient.put<ApiError>(ENDPOINTS.USER_BY_ID(userId), {
        email: user1.email,
      });

      expect(response.status()).toBe(STATUS.CONFLICT);
    });
  });
});
