/**
 * Test Setup for Chat UI Package
 * Configures testing environment for React components
 */

import { Window } from "happy-dom";
import "@testing-library/jest-dom";

// Create happy-dom window and set up DOM globals
const window = new Window({
  url: "http://localhost",
  width: 1024,
  height: 768,
});

global.window = window as any;
global.document = window.document;
global.navigator = window.navigator as any;
global.HTMLElement = window.HTMLElement as any;

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
const mockFn = () => {};
global.console = {
  ...console,
  warn: mockFn,
  error: mockFn,
};

// Mock socket.io-client
import { mock } from "bun:test";

const mockSocket = {
  on: mock(() => {}),
  emit: mock(() => {}),
  off: mock(() => {}),
  disconnect: mock(() => {}),
  connect: mock(() => {}),
  id: "mock-socket-id",
  connected: false,
};

const mockIo = mock(() => mockSocket);

// Mock socket.io-client module
mock.module("socket.io-client", () => ({
  io: mockIo,
  Socket: class MockSocket {
    on = mock(() => {});
    emit = mock(() => {});
    off = mock(() => {});
    disconnect = mock(() => {});
    connect = mock(() => {});
    id = "mock-socket-id";
    connected = false;
  },
}));
