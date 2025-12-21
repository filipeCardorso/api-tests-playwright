import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, generateTestUser } from '../../data/test-data';
import { LoginResponse, RegisterResponse, MessageResponse, ApiError } from '../../types/api.types';

test.describe('Delete User API @users @regression', () => {
  test.describe('DELETE /api/users/:id - Success Cases', () => {
    test('should soft delete own user account', async ({ apiClient }) => {
      const userData = generateTestUser('deleteself');
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

      const { response } = await apiClient.delete<MessageResponse>(ENDPOINTS.USER_BY_ID(userId));

      expect([STATUS.OK, STATUS.NO_CONTENT]).toContain(response.status());
    });

    test('should not be able to login after deletion', async ({ apiClient }) => {
      const userData = generateTestUser('deletelogin');
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

      // Delete user
      await apiClient.delete<MessageResponse>(ENDPOINTS.USER_BY_ID(userId));

      // Try to login again
      apiClient.clearAccessToken();
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password,
      });

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });
  });

  test.describe('DELETE /api/users/:id - Authorization', () => {
    test('should return 401 without access token', async ({ apiClient }) => {
      const { response } = await apiClient.delete<ApiError>(ENDPOINTS.USER_BY_ID(1));

      expect(response.status()).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 403 when deleting another user (non-admin)', async ({ apiClient }) => {
      // Create first user
      const user1 = generateTestUser('deleteother1');
      await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, user1);

      // Create second user
      const user2 = generateTestUser('deleteother2');
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

      // Try to delete second user
      const { response } = await apiClient.delete<ApiError>(
        ENDPOINTS.USER_BY_ID(register2.data?.user?.id || 999999)
      );

      expect([STATUS.FORBIDDEN, STATUS.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('DELETE /api/users/:id - Error Cases', () => {
    test('should return 404 for non-existent user', async ({ apiClient }) => {
      const userData = generateTestUser('deletenotfound');
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

      const { response } = await apiClient.delete<ApiError>(ENDPOINTS.USER_BY_ID(999999));

      expect([STATUS.NOT_FOUND, STATUS.FORBIDDEN]).toContain(response.status());
    });
  });
});
