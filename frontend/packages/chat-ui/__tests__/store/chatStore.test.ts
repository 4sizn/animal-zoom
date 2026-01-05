/**
 * Chat Store Tests
 * Tests for Zustand state management and WebSocket integration
 */

import { beforeEach, describe, expect, it } from "bun:test";
import type { ChatMessage } from "@animal-zoom/shared/types";
import { useChatStore } from "../../src/store/chatStore";

describe("ChatStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isOpen: true,
      inputValue: "",
      roomId: null,
      userId: null,
      userName: null,
      connectionState: "disconnected",
    });
  });

  describe("Messages", () => {
    it("should add a message", () => {
      const message: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "Test User",
        message: "Hello World",
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(message);

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toEqual(message);
    });

    it("should add multiple messages", () => {
      const message1: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "First message",
        timestamp: new Date(),
        type: "text",
      };

      const message2: ChatMessage = {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Second message",
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(message1);
      useChatStore.getState().addMessage(message2);

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(2);
      expect(state.messages[0]).toEqual(message1);
      expect(state.messages[1]).toEqual(message2);
    });

    it("should clear all messages", () => {
      const message: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "Test User",
        message: "Test",
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(message);
      expect(useChatStore.getState().messages).toHaveLength(1);

      useChatStore.getState().clearMessages();
      expect(useChatStore.getState().messages).toHaveLength(0);
    });
  });

  describe("UI State", () => {
    it("should toggle chat open/close", () => {
      const initialState = useChatStore.getState().isOpen;

      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(!initialState);

      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(initialState);
    });

    it("should set chat open state directly", () => {
      useChatStore.getState().setIsOpen(false);
      expect(useChatStore.getState().isOpen).toBe(false);

      useChatStore.getState().setIsOpen(true);
      expect(useChatStore.getState().isOpen).toBe(true);
    });

    it("should update input value", () => {
      const testValue = "Test input";

      useChatStore.getState().setInputValue(testValue);
      expect(useChatStore.getState().inputValue).toBe(testValue);
    });
  });

  describe("User and Room Management", () => {
    it("should set user information", () => {
      const userId = "user-123";
      const userName = "Test User";

      useChatStore.getState().setUser(userId, userName);

      const state = useChatStore.getState();
      expect(state.userId).toBe(userId);
      expect(state.userName).toBe(userName);
    });

    it("should set room ID", () => {
      const roomId = "room-456";

      useChatStore.getState().setRoomId(roomId);
      expect(useChatStore.getState().roomId).toBe(roomId);
    });

    it("should update room ID when joining room", () => {
      const roomCode = "TEST123";

      // Note: joinRoom calls wsController.joinRoom which is mocked
      useChatStore.getState().joinRoom(roomCode);
      expect(useChatStore.getState().roomId).toBe(roomCode);
    });
  });

  describe("Connection State", () => {
    it("should have initial connection state as disconnected", () => {
      const state = useChatStore.getState();
      expect(state.connectionState).toBe("disconnected");
    });

    it("should have WebSocket methods available", () => {
      const state = useChatStore.getState();

      expect(typeof state.connectWebSocket).toBe("function");
      expect(typeof state.disconnectWebSocket).toBe("function");
      expect(typeof state.joinRoom).toBe("function");
      expect(typeof state.sendMessage).toBe("function");
    });
  });

  describe("Store Integration", () => {
    it("should maintain state consistency", () => {
      // Setup user and room
      useChatStore.getState().setUser("user-1", "Test User");
      useChatStore.getState().setRoomId("room-1");

      // Add message
      const message: ChatMessage = {
        id: "1",
        roomId: "room-1",
        userId: "user-1",
        userName: "Test User",
        message: "Test message",
        timestamp: new Date(),
        type: "text",
      };
      useChatStore.getState().addMessage(message);

      // Verify all state
      const state = useChatStore.getState();
      expect(state.userId).toBe("user-1");
      expect(state.userName).toBe("Test User");
      expect(state.roomId).toBe("room-1");
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].userId).toBe("user-1");
    });

    it("should handle multiple state updates", () => {
      // Multiple rapid state updates
      useChatStore.getState().setUser("user-1", "User 1");
      useChatStore.getState().setRoomId("room-1");
      useChatStore.getState().setInputValue("typing...");
      useChatStore.getState().setIsOpen(true);

      const state = useChatStore.getState();
      expect(state.userId).toBe("user-1");
      expect(state.userName).toBe("User 1");
      expect(state.roomId).toBe("room-1");
      expect(state.inputValue).toBe("typing...");
      expect(state.isOpen).toBe(true);
    });
  });
});
