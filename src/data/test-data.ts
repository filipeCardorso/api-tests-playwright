/**
 * Test data constants and generators
 */

// ============================================================
// Valid Test Data
// ============================================================

export const VALID_USER = {
  name: 'Valid Test User',
  email: 'valid.user@test.com',
  password: 'ValidPass123',
};

export const VALID_ADMIN = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'AdminPass123',
};

// ============================================================
// Invalid Test Data
// ============================================================

export const INVALID_EMAILS = [
  '',
  'invalid',
  'invalid@',
  '@invalid.com',
  'invalid@.com',
  'invalid@com',
  'spaces in@email.com',
];

export const INVALID_PASSWORDS = [
  '',           // empty
  'short',      // too short
  'nouppercase123',  // no uppercase
  'NOLOWERCASE123',  // no lowercase
  'NoNumbers',  // no numbers
];

export const INVALID_NAMES = [
  '',           // empty
  ' ',          // only space
  'a',          // too short (if min length is required)
];

// ============================================================
// Data Generators
// ============================================================

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}.${timestamp}.${random}@playwright.test`;
}

/**
 * Generate a unique user for testing
 */
export function generateTestUser(prefix: string = 'test'): {
  name: string;
  email: string;
  password: string;
} {
  const timestamp = Date.now();
  return {
    name: `${prefix} User ${timestamp}`,
    email: generateUniqueEmail(prefix),
    password: 'Test123456',
  };
}

/**
 * Generate random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================
// Expected Messages
// ============================================================

export const MESSAGES = {
  REGISTER_SUCCESS: 'Usuário criado. Verifique seu email.',
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  EMAIL_VERIFIED: 'Email verificado com sucesso',
  PASSWORD_RESET_SENT: 'Se o email existir, enviaremos instruções de recuperação',
  PASSWORD_CHANGED: 'Senha alterada com sucesso',
  USER_DELETED: 'Usuário deletado com sucesso',
  UNAUTHORIZED: 'Token inválido ou expirado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Usuário não encontrado',
  EMAIL_EXISTS: 'Email já cadastrado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  EMAIL_NOT_VERIFIED: 'Email não verificado',
};

// ============================================================
// HTTP Status Codes
// ============================================================

export const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// ============================================================
// API Endpoints
// ============================================================

export const ENDPOINTS = {
  // Health
  HEALTH: '/api/health',
  VERSION: '/api/v1',

  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: number) => `/api/users/${id}`,

  // Admin
  ADMIN_USER_ROLE: (id: number) => `/api/admin/users/${id}/role`,
  ADMIN_AUDIT_LOGS: '/api/admin/audit-logs',
};
