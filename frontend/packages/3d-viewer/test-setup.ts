/**
 * Test setup for 3D Viewer
 * Provides mocks for browser APIs not available in Bun test environment
 */

// Mock localStorage
const localStorageMock = {
  store: new Map<string, string>(),
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  },
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  },
  removeItem(key: string): void {
    this.store.delete(key);
  },
  clear(): void {
    this.store.clear();
  },
  get length(): number {
    return this.store.size;
  },
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  },
};

// @ts-ignore
globalThis.localStorage = localStorageMock;

// Mock HTMLCanvasElement
class MockCanvas {
  width = 800;
  height = 600;

  getContext() {
    return {};
  }

  getBoundingClientRect() {
    return {
      width: this.width,
      height: this.height,
      top: 0,
      left: 0,
      bottom: this.height,
      right: this.width,
    };
  }
}

// @ts-ignore
globalThis.HTMLCanvasElement = MockCanvas;

// Mock window for tests
if (typeof window === 'undefined') {
  // @ts-ignore
  globalThis.window = {
    innerWidth: 1024,
    innerHeight: 768,
    localStorage: localStorageMock,
  };
}
