/**
 * WebSocket Client Tests
 * Basic tests to verify Socket client functionality
 */

import "./setup";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { destroySocketClient, getSocketClient, SocketClient } from "../client";

describe("Socket Client", () => {
  let client: SocketClient;

  beforeEach(() => {
    // Create fresh client for each test
    client = new SocketClient({ autoConnect: false });
  });

  afterEach(() => {
    // Cleanup
    client.destroy();
    destroySocketClient();
  });

  describe("Initialization", () => {
    it("should create socket client instance", () => {
      expect(client).toBeDefined();
      expect(client instanceof SocketClient).toBe(true);
    });

    it("should not be connected initially", () => {
      expect(client.isConnected()).toBe(false);
    });

    it("should have no current room initially", () => {
      expect(client.getCurrentRoom()).toBeNull();
    });
  });

  describe("Methods", () => {
    it("should have all required methods", () => {
      expect(client.connect).toBeDefined();
      expect(client.disconnect).toBeDefined();
      expect(client.isConnected).toBeDefined();
      expect(client.joinRoom).toBeDefined();
      expect(client.leaveRoom).toBeDefined();
      expect(client.sendChatMessage).toBeDefined();
      expect(client.updateState).toBeDefined();
      expect(client.updateAvatar).toBeDefined();
      expect(client.setListeners).toBeDefined();
      expect(client.clearListeners).toBeDefined();
      expect(client.destroy).toBeDefined();
    });
  });

  describe("Singleton", () => {
    it("should return same instance from getSocketClient", () => {
      const instance1 = getSocketClient();
      const instance2 = getSocketClient();
      expect(instance1).toBe(instance2);
    });

    it("should destroy singleton instance", () => {
      const instance1 = getSocketClient();
      destroySocketClient();
      const instance2 = getSocketClient();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Event Listeners", () => {
    it("should set and clear event listeners", () => {
      const listeners = {
        onConnect: () => console.log("connected"),
        onDisconnect: () => console.log("disconnected"),
      };

      client.setListeners(listeners);
      client.clearListeners();

      // If no errors, test passes
      expect(true).toBe(true);
    });
  });
});
