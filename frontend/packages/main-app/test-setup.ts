/**
 * Test Setup
 * Global test configuration and mocks
 */

import { beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

beforeAll(() => {
  // Mock window.matchMedia if it doesn't exist
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  }
});
