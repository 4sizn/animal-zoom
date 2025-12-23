/**
 * Test setup file for bun test
 * Configures happy-dom for browser APIs like document and localStorage
 */

import { Window } from "happy-dom";

// Create a happy-dom window
const window = new Window();
const document = window.document;

// Register globals
(globalThis as any).window = window;
(globalThis as any).document = document;
(globalThis as any).navigator = window.navigator;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).Element = window.Element;

// Set up localStorage
const storage = new Map<string, string>();

(globalThis as any).localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() {
    return storage.size;
  },
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
};
