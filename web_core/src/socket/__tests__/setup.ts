/**
 * Test Setup for Socket Tests
 * Configures environment for WebSocket tests
 */

// Mock import.meta.env for testing
if (typeof (globalThis as any).import === 'undefined') {
  (globalThis as any).import = { meta: { env: {} } };
}

// Set test environment variables
import.meta.env = {
  VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
  VITE_WS_URL: process.env.VITE_WS_URL || 'http://localhost:3001',
  VITE_API_PREFIX: process.env.VITE_API_PREFIX || '',
  VITE_APP_NAME: process.env.VITE_APP_NAME || 'Animal Zoom',
  VITE_APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
  VITE_DEBUG: process.env.VITE_DEBUG || 'false',
  VITE_LOG_LEVEL: (process.env.VITE_LOG_LEVEL || 'error') as 'trace' | 'debug' | 'info' | 'warn' | 'error',
  VITE_ENABLE_INSPECTOR: process.env.VITE_ENABLE_INSPECTOR || 'false',
  VITE_ENABLE_CONSOLE_LOGS: process.env.VITE_ENABLE_CONSOLE_LOGS || 'false',
};

// Mock localStorage for tests
if (typeof localStorage === 'undefined') {
  const storage = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  };
}

export {};
