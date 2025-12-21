import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS, MESSAGES, INVALID_EMAILS, INVALID_PASSWORDS, generateTestUser } from '../../data/test-data';
import { RegisterResponse, ApiError } from '../../types/api.types';

test.describe('Register API @auth @regression', () => {
  test.describe('POST /api/auth/register - Success Cases', () => {
    test('should register a new user with valid data', async ({ apiClient }) => {
      const userData = generateTestUser('register');

      const { response, data } = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.CREATED);
      expect(data).toBeDefined();
      expect(data.message).toBe(MESSAGES.REGISTER_SUCCESS);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(userData.email);
      expect(data.user.name).toBe(userData.name);
      expect(data.user.role).toBe('user');
      expect(data.user.emailVerified).toBe(false);
      expect(data.user).not.toHaveProperty('password');
    });

    test('should not return password in response', async ({ apiClient }) => {
      const userData = generateTestUser('nopass');

      const { response, data } = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.CREATED);
      expect(data.user).not.toHaveProperty('password');
      expect(JSON.stringify(data)).not.toContain(userData.password);
    });

    test('should create user with default role as "user"', async ({ apiClient }) => {
      const userData = generateTestUser('role');

      const { response, data } = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.CREATED);
      expect(data.user.role).toBe('user');
    });

    test('should set emailVerified to false for new users', async ({ apiClient }) => {
      const userData = generateTestUser('emailverify');

      const { response, data } = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.CREATED);
      expect(data.user.emailVerified).toBe(false);
    });
  });

  test.describe('POST /api/auth/register - Validation Errors', () => {
    test('should return 400 when email is missing', async ({ apiClient }) => {
      const userData = {
        name: 'Test User',
        password: 'Test123456',
      };

      const { response, data } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
      expect(data.error || data.message).toBeDefined();
    });

    test('should return 400 when password is missing', async ({ apiClient }) => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const { response, data } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });

    test('should return 400 when name is missing', async ({ apiClient }) => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123456',
      };

      const { response, data } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });

    test('should return 400 when body is empty', async ({ apiClient }) => {
      const { response } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, {});

      expect(response.status()).toBe(STATUS.BAD_REQUEST);
    });

    INVALID_EMAILS.forEach((invalidEmail) => {
      test(`should return 400 for invalid email: "${invalidEmail || '(empty)'}"`, async ({ apiClient }) => {
        const userData = {
          name: 'Test User',
          email: invalidEmail,
          password: 'Test123456',
        };

        const { response } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

        expect(response.status()).toBe(STATUS.BAD_REQUEST);
      });
    });

    INVALID_PASSWORDS.forEach((invalidPassword) => {
      test(`should return 400 for invalid password: "${invalidPassword || '(empty)'}"`, async ({ apiClient }) => {
        const userData = {
          name: 'Test User',
          email: 'valid@email.com',
          password: invalidPassword,
        };

        const { response } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

        expect(response.status()).toBe(STATUS.BAD_REQUEST);
      });
    });
  });

  test.describe('POST /api/auth/register - Duplicate Email', () => {
    test('should return 409 when email already exists', async ({ apiClient }) => {
      const userData = generateTestUser('duplicate');

      // First registration
      const { response: firstResponse } = await apiClient.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);
      expect(firstResponse.status()).toBe(STATUS.CREATED);

      // Second registration with same email
      const { response: secondResponse, data } = await apiClient.post<ApiError>(ENDPOINTS.REGISTER, userData);

      expect(secondResponse.status()).toBe(STATUS.CONFLICT);
    });
  });
});
