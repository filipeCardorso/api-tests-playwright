import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS } from '../../data/test-data';
import { HealthResponse, ApiVersionResponse } from '../../types/api.types';

test.describe('Health Check API @health @smoke', () => {
  test.describe('GET /api/health', () => {
    test('should return healthy status with all system metrics', async ({ apiClient }) => {
      const { response, data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      expect(typeof data.uptime).toBe('number');
      expect(data.responseTime).toMatch(/^\d+ms$/);
    });

    test('should return database connection status', async ({ apiClient }) => {
      const { response, data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);

      expect(response.status()).toBe(STATUS.OK);
      expect(data.checks).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.checks.database.status).toBe('connected');
      expect(data.checks.database.latency).toMatch(/^\d+ms$/);
      expect(data.checks.database.error).toBeNull();
    });

    test('should return system memory information', async ({ apiClient }) => {
      const { response, data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);

      expect(response.status()).toBe(STATUS.OK);
      expect(data.system).toBeDefined();
      expect(data.system.memory).toBeDefined();
      expect(data.system.memory.heapUsed).toMatch(/^\d+MB$/);
      expect(data.system.memory.heapTotal).toMatch(/^\d+MB$/);
      expect(data.system.memory.rss).toMatch(/^\d+MB$/);
    });

    test('should return Node.js version', async ({ apiClient }) => {
      const { response, data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);

      expect(response.status()).toBe(STATUS.OK);
      expect(data.system.nodeVersion).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    test('should respond within acceptable time limit', async ({ apiClient }) => {
      const startTime = Date.now();
      const { response } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);
      const endTime = Date.now();

      expect(response.status()).toBe(STATUS.OK);
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  test.describe('GET /api/v1', () => {
    test('should return API version information', async ({ apiClient }) => {
      const { response, data } = await apiClient.get<ApiVersionResponse>(ENDPOINTS.VERSION);

      expect(response.status()).toBe(STATUS.OK);
      expect(data).toBeDefined();
      expect(data.version).toBe('1.0.0');
      expect(data.status).toBe('stable');
      expect(data.documentation).toBe('/docs');
    });

    test('should have correct content-type header', async ({ apiClient }) => {
      const { response } = await apiClient.get<ApiVersionResponse>(ENDPOINTS.VERSION);

      expect(response.status()).toBe(STATUS.OK);
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});
