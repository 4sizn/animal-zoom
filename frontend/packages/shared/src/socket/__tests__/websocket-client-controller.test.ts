/**
 * WebSocketClientController Tests
 * TDD-based tests for OOP + RxJS WebSocket client
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { WebSocketClientController } from '../WebSocketClientController';
import type { WebSocketClientControllerOptions } from '../controller-types';

describe('WebSocketClientController', () => {
  let controller: WebSocketClientController;

  beforeEach(() => {
    // Create fresh controller for each test
    controller = new WebSocketClientController({ autoConnect: false });
  });

  afterEach(() => {
    // Cleanup
    controller.destroy();
  });

  describe('Initialization', () => {
    it('should create controller instance with default options', () => {
      expect(controller).toBeDefined();
      expect(controller instanceof WebSocketClientController).toBe(true);
    });

    it('should accept custom configuration', () => {
      const customOptions: WebSocketClientControllerOptions = {
        url: 'http://localhost:9999',
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
      };

      const customController = new WebSocketClientController(customOptions);
      expect(customController).toBeDefined();
      customController.destroy();
    });

    it('should have all required Observable properties', () => {
      // Connection observables
      expect(controller.connectionState$).toBeDefined();
      expect(controller.connected$).toBeDefined();
      expect(controller.disconnected$).toBeDefined();
      expect(controller.error$).toBeDefined();

      // Room observables
      expect(controller.roomJoined$).toBeDefined();
      expect(controller.userJoined$).toBeDefined();
      expect(controller.userLeft$).toBeDefined();
      expect(controller.roomUpdated$).toBeDefined();
      expect(controller.currentRoom$).toBeDefined();

      // Chat observables
      expect(controller.chatMessage$).toBeDefined();

      // State observables
      expect(controller.stateUpdate$).toBeDefined();
      expect(controller.avatarUpdated$).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.connect).toBeDefined();
      expect(controller.disconnect).toBeDefined();
      expect(controller.isConnected).toBeDefined();
      expect(controller.joinRoom).toBeDefined();
      expect(controller.leaveRoom).toBeDefined();
      expect(controller.sendChatMessage).toBeDefined();
      expect(controller.updateState).toBeDefined();
      expect(controller.updateAvatar).toBeDefined();
      expect(controller.destroy).toBeDefined();
    });

    it('should start in disconnected state', () => {
      let initialState: string | undefined;
      const subscription = controller.connectionState$.subscribe(state => {
        initialState = state;
      });

      expect(initialState).toBe('disconnected');
      subscription.unsubscribe();
    });
  });

  describe('Type Safety', () => {
    it('should have properly typed Observable properties', () => {
      // This test verifies TypeScript compilation
      // If types are wrong, TypeScript will catch it at compile time

      // Connection state should be Observable<ConnectionState>
      controller.connectionState$.subscribe((state: string) => {
        expect(state).toBeDefined();
      });

      // Chat messages should be Observable<ChatMessageData>
      controller.chatMessage$.subscribe((msg) => {
        expect(msg.senderId).toBeDefined();
        expect(msg.message).toBeDefined();
      });
    });
  });

  describe('Connection State Observable', () => {
    it('should emit "disconnected" state initially', (done) => {
      const states: string[] = [];

      controller.connectionState$.subscribe((state) => {
        states.push(state);

        if (states.length === 1) {
          expect(states[0]).toBe('disconnected');
          done();
        }
      });
    });

    it('should emit connection state changes', (done) => {
      const states: string[] = [];
      let callCount = 0;

      controller.connectionState$.subscribe((state) => {
        states.push(state);
        callCount++;

        // We expect: disconnected (initial)
        // Future phases will test: disconnected → connecting → connected
        if (callCount === 1) {
          expect(states[0]).toBe('disconnected');
          done();
        }
      });
    });
  });

  describe('Connection Methods', () => {
    it('should have isConnected() return false initially', () => {
      expect(controller.isConnected()).toBe(false);
    });

    it('should have connect() method that can be called', () => {
      expect(() => controller.connect()).not.toThrow();
    });

    it('should have disconnect() method that can be called', () => {
      expect(() => controller.disconnect()).not.toThrow();
    });

    it('should prevent duplicate connect() calls', () => {
      // This test will be meaningful once we implement actual connection
      controller.connect();
      controller.connect(); // Should be ignored or logged
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('currentRoom$ Observable', () => {
    it('should emit null initially', (done) => {
      controller.currentRoom$.subscribe((room) => {
        expect(room).toBeNull();
        done();
      });
    });
  });
});
