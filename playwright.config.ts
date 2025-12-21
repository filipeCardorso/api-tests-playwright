import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Parallel workers */
  workers: process.env.CI ? 4 : undefined,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  /* Timeout for each test */
  timeout: 30000,

  /* Timeout for expect assertions */
  expect: {
    timeout: 10000,
  },

  /* Global setup/teardown */
  globalSetup: './src/fixtures/global-setup.ts',
  globalTeardown: './src/fixtures/global-teardown.ts',

  /* Shared settings for all projects */
  use: {
    /* Base URL for API requests */
    baseURL: process.env.API_BASE_URL || 'https://api-project-gules.vercel.app',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* Configure projects for different environments */
  projects: [
    {
      name: 'development',
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'staging',
      use: {
        baseURL: process.env.STAGING_URL || 'https://api-project-gules.vercel.app',
      },
    },
    {
      name: 'production',
      use: {
        baseURL: 'https://api-project-gules.vercel.app',
      },
    },
  ],
});
