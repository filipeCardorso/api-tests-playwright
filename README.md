![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Allure](https://img.shields.io/badge/Allure_Report-FF5722?style=flat-square&logo=allure&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=node.js&logoColor=white)

# 🎭 API Tests - Playwright

Automated API tests for [api-project](https://github.com/filipeCardorso/api-project) using Playwright + TypeScript.

[![API Tests - Playwright](https://github.com/filipeCardorso/api-tests-playwright/actions/workflows/tests.yml/badge.svg)](https://github.com/filipeCardorso/api-tests-playwright/actions/workflows/tests.yml)

## 📋 Overview

This project contains automated tests for the User Management API, covering:

- ✅ Health Check endpoints
- ✅ Authentication (register, login, logout, refresh token)
- ✅ User CRUD operations
- ✅ Authorization and permissions

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Playwright | 1.49+ | Test framework |
| TypeScript | 5.x | Language |
| Node.js | 20+ | Runtime |
| Allure | 3.x | Reports (optional) |

## 📁 Project Structure

```
api-tests-playwright/
├── src/
│   ├── tests/
│   │   ├── auth/           # Authentication tests
│   │   ├── users/          # User CRUD tests
│   │   └── health/         # Health check tests
│   ├── helpers/
│   │   ├── api-client.ts   # HTTP client wrapper
│   │   └── auth-helper.ts  # Authentication utilities
│   ├── fixtures/
│   │   ├── api-fixtures.ts # Test fixtures
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── data/
│   │   └── test-data.ts    # Test data and constants
│   └── types/
│       └── api.types.ts    # TypeScript interfaces
├── reports/                # Test reports output
├── playwright.config.ts    # Playwright configuration
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/filipeCardorso/api-tests-playwright.git
cd api-tests-playwright

# Install dependencies
npm install

# Install Playwright browsers (not needed for API tests, but useful for debugging)
npx playwright install
```

### Configuration

Copy the environment file and configure as needed:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
API_BASE_URL=https://api-project-gules.vercel.app
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run by Tag

```bash
# Smoke tests (quick validation)
npm run test:smoke

# Authentication tests
npm run test:auth

# User tests
npm run test:users

# Health check tests
npm run test:health
```

### Run by Environment

```bash
# Development (localhost)
npx playwright test --project=development

# Staging
npx playwright test --project=staging

# Production
npx playwright test --project=production
```

### Debug Mode

```bash
# Run with Playwright UI
npm run test:ui

# Run with debugger
npm run test:debug

# Run headed (visible browser)
npm run test:headed
```

## 📊 Reports

### HTML Report

After running tests, view the HTML report:

```bash
npm run report
```

Reports are generated in `reports/html/`.

### Allure Report (Optional)

```bash
npm run report:allure
```

## 🏷️ Test Tags

Tests are organized with tags for selective execution:

| Tag | Description |
|-----|-------------|
| `@smoke` | Quick validation tests |
| `@regression` | Full regression suite |
| `@auth` | Authentication tests |
| `@users` | User management tests |
| `@health` | Health check tests |

## 🔄 CI/CD Integration

### GitHub Actions

This project includes a GitHub Actions workflow that:

- Runs on push to `main`
- Runs on pull requests
- Can be triggered manually
- Can be triggered by other repositories via `repository_dispatch`
- Runs daily at 6 AM UTC

### Triggering from API Project

Add this step to your API project's workflow to trigger tests:

```yaml
- name: Trigger API Tests
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.REPO_ACCESS_TOKEN }}
    repository: filipeCardorso/api-tests-playwright
    event-type: run-api-tests
    client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../../fixtures/api-fixtures';
import { ENDPOINTS, STATUS } from '../../data/test-data';

test.describe('Feature @tag', () => {
  test('should do something', async ({ apiClient }) => {
    const { response, data } = await apiClient.get(ENDPOINTS.HEALTH);

    expect(response.status()).toBe(STATUS.OK);
    expect(data).toBeDefined();
  });
});
```

### Using Authentication

```typescript
test('should access protected resource', async ({ apiClient, authHelper }) => {
  // Login
  const { context } = await authHelper.login({
    email: 'user@test.com',
    password: 'Password123',
  });

  // Make authenticated request
  const { response, data } = await apiClient.get(ENDPOINTS.ME);

  expect(response.status()).toBe(STATUS.OK);
});
```

## 🔗 Related Projects

- [api-project](https://github.com/filipeCardorso/api-project) - The API being tested
- [API Swagger Docs](https://api-project-gules.vercel.app/docs)

## 📄 License

MIT
