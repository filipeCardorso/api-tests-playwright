import { FullConfig } from '@playwright/test';

/**
 * Global setup runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n🚀 Starting API Tests Suite');
  console.log(`📍 Base URL: ${config.projects[0]?.use?.baseURL || 'Not configured'}`);
  console.log(`🔧 Workers: ${config.workers}`);
  console.log(`🔄 Retries: ${config.projects[0]?.retries || 0}`);
  console.log('─'.repeat(50));

  // You can add global setup logic here:
  // - Create test database
  // - Seed test data
  // - Setup test users
  // - Initialize external services
}

export default globalSetup;
