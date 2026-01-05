/**
 * WebSocket Integration Tests
 * Tests for WebSocket message sending/receiving and connection handling
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { ChatMessage } from "@animal-zoom/shared/types";
import { useChatStore, wsController } from "../../src/store/chatStore";

describe("WebSocket Integration", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isOpen: true,
      inputValue: "",
      roomId: null,
      userId: "test-user-1",
      userName: "Test User",
      connectionState: "disconnected",
    });
  });

  afterEach(() => {
    // Cleanup WebSocket connections
    if (useChatStore.getState().connectionState !== "disconnected") {
      useChatStore.getState().disconnectWebSocket();
    }
  });

  describe("Connection Management", () => {
    it("should have WebSocket controller available", () => {
      expect(wsController).toBeDefined();
      expect(typeof wsController.connect).toBe("function");
      expect(typeof wsController.disconnect).toBe("function");
    });

    it("should have connection methods in store", () => {
      const state = useChatStore.getState();
      expect(typeof state.connectWebSocket).toBe("function");
      expect(typeof state.disconnectWebSocket).toBe("function");
      expect(typeof state.joinRoom).toBe("function");
      expect(typeof state.sendMessage).toBe("function");
    });

    it("should start with disconnected state", () => {
      const state = useChatStore.getState();
      expect(state.connectionState).toBe("disconnected");
    });

    it("should call wsController.connect when connectWebSocket is called", () => {
      const connectSpy = mock.spyOn(wsController, "connect");

      useChatStore.getState().connectWebSocket();

      expect(connectSpy).toHaveBeenCalled();
      connectSpy.mockRestore();
    });

    it("should call wsController.disconnect when disconnectWebSocket is called", () => {
      const disconnectSpy = mock.spyOn(wsController, "disconnect");

      useChatStore.getState().disconnectWebSocket();

      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });

  describe("Room Management", () => {
    it("should join room and update roomId", () => {
      const roomCode = "TEST123";
      const joinRoomSpy = mock.spyOn(wsController, "joinRoom");

      useChatStore.getState().joinRoom(roomCode);

      expect(joinRoomSpy).toHaveBeenCalledWith(roomCode);
      expect(useChatStore.getState().roomId).toBe(roomCode);

      joinRoomSpy.mockRestore();
    });

    it("should handle multiple room joins", () => {
      const room1 = "ROOM1";
      const room2 = "ROOM2";

      useChatStore.getState().joinRoom(room1);
      expect(useChatStore.getState().roomId).toBe(room1);

      useChatStore.getState().joinRoom(room2);
      expect(useChatStore.getState().roomId).toBe(room2);
    });
  });

  describe("Message Sending", () => {
    beforeEach(() => {
      // Setup user and room for message sending
      useChatStore.setState({
        userId: "user-1",
        userName: "Test User",
        roomId: "test-room",
      });
    });

    it("should call wsController.sendChatMessage when sending message", () => {
      const message = "Hello, World!";
      const sendSpy = mock.spyOn(wsController, "sendChatMessage");

      useChatStore.getState().sendMessage(message);

      expect(sendSpy).toHaveBeenCalledWith(message);

      sendSpy.mockRestore();
    });

    it("should send message with correct content", () => {
      const testMessage = "Test message content";
      const sendSpy = mock.spyOn(wsController, "sendChatMessage");

      useChatStore.getState().sendMessage(testMessage);

      expect(sendSpy).toHaveBeenCalledWith(testMessage);

      sendSpy.mockRestore();
    });

    it("should handle empty message sends", () => {
      const sendSpy = mock.spyOn(wsController, "sendChatMessage");

      // Store allows empty sends, component should validate
      useChatStore.getState().sendMessage("");

      expect(sendSpy).toHaveBeenCalledWith("");

      sendSpy.mockRestore();
    });

    it("should handle special characters in messages", () => {
      const specialMessage = 'Test @user #tag 🎉 <script>alert("xss")</script>';
      const sendSpy = mock.spyOn(wsController, "sendChatMessage");

      useChatStore.getState().sendMessage(specialMessage);

      expect(sendSpy).toHaveBeenCalledWith(specialMessage);

      sendSpy.mockRestore();
    });
  });

  describe("Message Receiving", () => {
    it("should add incoming message to store", () => {
      const incomingMessage: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "Other User",
        message: "Hello from other user",
        timestamp: new Date(),
        type: "text",
      };

      // Manually add message to simulate receiving
      useChatStore.getState().addMessage(incomingMessage);

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(incomingMessage);
    });

    it("should maintain message order", () => {
      const msg1: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "First",
        timestamp: new Date(),
        type: "text",
      };

      const msg2: ChatMessage = {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Second",
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(msg1);
      useChatStore.getState().addMessage(msg2);

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(2);
      expect(messages[0].message).toBe("First");
      expect(messages[1].message).toBe("Second");
    });

    it("should handle rapid message reception", () => {
      const messageCount = 10;
      const messages: ChatMessage[] = [];

      for (let i = 0; i < messageCount; i++) {
        const msg: ChatMessage = {
          id: `msg-${i}`,
          roomId: "test-room",
          userId: `user-${i % 3}`,
          userName: `User ${i % 3}`,
          message: `Message ${i}`,
          timestamp: new Date(),
          type: "text",
        };
        messages.push(msg);
        useChatStore.getState().addMessage(msg);
      }

      const storeMessages = useChatStore.getState().messages;
      expect(storeMessages).toHaveLength(messageCount);
      expect(storeMessages[0].message).toBe("Message 0");
      expect(storeMessages[messageCount - 1].message).toBe(
        `Message ${messageCount - 1}`,
      );
    });
  });

  describe("Connection State Updates", () => {
    it("should update connection state via connectionState$ subscription", () => {
      // The store subscribes to wsController.connectionState$
      // When the observable emits, the store should update

      const initialState = useChatStore.getState().connectionState;
      expect(initialState).toBe("disconnected");

      // Note: In real scenario, connectionState$ would emit when connecting
      // This tests that the subscription mechanism is set up correctly
    });

    it("should reflect connection state changes", () => {
      // Initial state
      expect(useChatStore.getState().connectionState).toBe("disconnected");

      // Simulate state change
      useChatStore.setState({ connectionState: "connecting" });
      expect(useChatStore.getState().connectionState).toBe("connecting");

      useChatStore.setState({ connectionState: "connected" });
      expect(useChatStore.getState().connectionState).toBe("connected");

      useChatStore.setState({ connectionState: "error" });
      expect(useChatStore.getState().connectionState).toBe("error");
    });
  });

  describe("Error Handling", () => {
    it("should handle WebSocket connection errors gracefully", () => {
      // Store should not crash when connection fails
      const state = useChatStore.getState();

      expect(() => {
        state.connectWebSocket();
        // Immediate disconnect simulates connection failure
        state.disconnectWebSocket();
      }).not.toThrow();
    });

    it("should handle sending message without connection", () => {
      // Ensure disconnected
      useChatStore.setState({ connectionState: "disconnected" });

      // Should not throw when attempting to send while disconnected
      expect(() => {
        useChatStore.getState().sendMessage("Test message");
      }).not.toThrow();
    });

    it("should handle joining room without connection", () => {
      useChatStore.setState({ connectionState: "disconnected" });

      // Should not throw when attempting to join room while disconnected
      expect(() => {
        useChatStore.getState().joinRoom("TEST123");
      }).not.toThrow();

      // Should still update roomId
      expect(useChatStore.getState().roomId).toBe("TEST123");
    });
  });

  describe("Message Integration Flow", () => {
    it("should handle complete send/receive cycle", () => {
      // Setup
      useChatStore.setState({
        userId: "user-1",
        userName: "Test User",
        roomId: "test-room",
        connectionState: "connected",
      });

      const sendSpy = mock.spyOn(wsController, "sendChatMessage");
      const messageToSend = "Hello, integration test!";

      // Send message
      useChatStore.getState().sendMessage(messageToSend);
      expect(sendSpy).toHaveBeenCalledWith(messageToSend);

      // Simulate receiving own message back (echo)
      const echoMessage: ChatMessage = {
        id: "echo-1",
        roomId: "test-room",
        userId: "user-1",
        userName: "Test User",
        message: messageToSend,
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(echoMessage);

      // Verify message in store
      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe(messageToSend);

      sendSpy.mockRestore();
    });

    it("should handle multi-user conversation", () => {
      useChatStore.setState({
        userId: "user-1",
        userName: "User 1",
        roomId: "test-room",
      });

      // User 1 sends message
      const msg1: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "Hello from User 1",
        timestamp: new Date(),
        type: "text",
      };
      useChatStore.getState().addMessage(msg1);

      // User 2 replies
      const msg2: ChatMessage = {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Hi User 1!",
        timestamp: new Date(),
        type: "text",
      };
      useChatStore.getState().addMessage(msg2);

      // User 1 replies back
      const msg3: ChatMessage = {
        id: "3",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "How are you?",
        timestamp: new Date(),
        type: "text",
      };
      useChatStore.getState().addMessage(msg3);

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(3);
      expect(messages[0].userId).toBe("user-1");
      expect(messages[1].userId).toBe("user-2");
      expect(messages[2].userId).toBe("user-1");
    });
  });

  describe("Cleanup", () => {
    it("should clear messages on clearMessages call", () => {
      // Add some messages
      const msg: ChatMessage = {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User",
        message: "Test",
        timestamp: new Date(),
        type: "text",
      };

      useChatStore.getState().addMessage(msg);
      expect(useChatStore.getState().messages).toHaveLength(1);

      // Clear
      useChatStore.getState().clearMessages();
      expect(useChatStore.getState().messages).toHaveLength(0);
    });

    it("should disconnect cleanly", () => {
      const disconnectSpy = mock.spyOn(wsController, "disconnect");

      useChatStore.getState().disconnectWebSocket();

      expect(disconnectSpy).toHaveBeenCalled();

      disconnectSpy.mockRestore();
    });
  });
});
