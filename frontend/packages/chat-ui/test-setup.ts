/**
 * Test Setup for Chat UI Package
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  key: (index: number) => null,
  length: 0,
};

global.localStorage = localStorageMock as Storage;

// Mock WebSocket
class MockWebSocket {
  readyState = 1; // OPEN
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

(global as any).WebSocket = MockWebSocket;

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
