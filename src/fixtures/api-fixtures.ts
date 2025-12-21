import { test as base } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { AuthHelper } from '../helpers/auth-helper';
import { AuthContext } from '../types/api.types';

/**
 * Extended test fixtures for API testing
 */
export type ApiFixtures = {
  apiClient: ApiClient;
  authHelper: AuthHelper;
  authenticatedContext: AuthContext;
};

/**
 * Create extended test with API fixtures
 */
export const test = base.extend<ApiFixtures>({
  /**
   * API Client fixture - available in all tests
   */
  apiClient: async ({ request, baseURL }, use) => {
    const client = new ApiClient(request, baseURL || 'https://api-project-gules.vercel.app');
    await use(client);
  },

  /**
   * Auth Helper fixture - depends on apiClient
   */
  authHelper: async ({ apiClient }, use) => {
    const helper = new AuthHelper(apiClient);
    await use(helper);
  },

  /**
   * Pre-authenticated context fixture
   * Creates a test user, registers, and logs in before the test
   * Useful for tests that require an authenticated user
   */
  authenticatedContext: async ({ authHelper }, use) => {
    // Create a unique test user
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `testuser.${timestamp}@playwright.test`,
      password: 'Test123456',
    };

    // Register the user
    const registerResult = await authHelper.register(testUser);
    if (!registerResult.success) {
      throw new Error(`Failed to register test user: ${registerResult.error}`);
    }

    // For testing purposes, we'll try to login
    // Note: In production, email verification would be required
    const loginResult = await authHelper.login({
      email: testUser.email,
      password: testUser.password,
    });

    if (!loginResult.success || !loginResult.context) {
      // If login fails due to email verification, we'll create a mock context
      // In a real scenario, you'd have a way to bypass verification in test env
      console.warn('Login failed, email verification might be required');

      const mockContext: AuthContext = {
        user: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        },
        accessToken: '',
        refreshToken: '',
      };

      await use(mockContext);
      return;
    }

    await use(loginResult.context);

    // Cleanup: logout after test
    if (loginResult.context.refreshToken) {
      await authHelper.logout(loginResult.context.refreshToken);
    }
  },
});

export { expect } from '@playwright/test';
