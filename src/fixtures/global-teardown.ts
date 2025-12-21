import { FullConfig } from '@playwright/test';

/**
 * Global teardown runs once after all tests
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n─'.repeat(50));
  console.log('🏁 API Tests Suite Completed');
  console.log(`📊 Reports available in: ./reports/html`);

  // You can add global teardown logic here:
  // - Cleanup test database
  // - Remove test data
  // - Delete test users
  // - Close external connections
}

export default globalTeardown;
