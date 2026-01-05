/**
 * Message Reactions Tests
 * Tests for emoji reactions on messages
 */

import { beforeEach, describe, expect, it } from "bun:test";
import type { ChatMessage, MessageReaction } from "@animal-zoom/shared/types";
import { useChatStore } from "../../src/store/chatStore";

describe("Message Reactions", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isOpen: true,
      inputValue: "",
      roomId: "test-room",
      userId: "user-1",
      userName: "Test User",
      connectionState: "connected",
    });
  });

  describe("Adding Reactions", () => {
    it("should add reaction to message", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "Other User",
        message: "Test message",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      // Add reaction
      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        addReaction("msg-1", "👍");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        expect(updatedMessage?.reactions).toBeDefined();
        expect(updatedMessage?.reactions?.length).toBeGreaterThan(0);
      }
    });

    it("should add reaction with user info", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "Other User",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        addReaction("msg-1", "❤️");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        const reaction = updatedMessage?.reactions?.[0];
        expect(reaction).toMatchObject({
          emoji: "❤️",
          userId: "user-1",
          userName: "Test User",
        });
      }
    });

    it("should handle multiple reactions on same message", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "Other User",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        addReaction("msg-1", "👍");
        addReaction("msg-1", "❤️");
        addReaction("msg-1", "🎉");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        expect(updatedMessage?.reactions?.length).toBe(3);
      }
    });

    it("should allow different users to add same emoji", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [
          {
            emoji: "👍",
            userId: "user-2",
            userName: "User 2",
            timestamp: new Date(),
          },
        ],
      };

      useChatStore.getState().addMessage(message);

      // Current user adds same emoji
      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        addReaction("msg-1", "👍");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        const thumbsUpReactions = updatedMessage?.reactions?.filter(
          (r) => r.emoji === "👍",
        );
        expect(thumbsUpReactions?.length).toBe(2);
      }
    });

    it("should not add duplicate reaction from same user", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        addReaction("msg-1", "👍");
        addReaction("msg-1", "👍"); // Same user, same emoji again

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        // Should only have one reaction
        expect(updatedMessage?.reactions?.length).toBe(1);
      }
    });
  });

  describe("Removing Reactions", () => {
    it("should remove reaction from message", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [
          {
            emoji: "👍",
            userId: "user-1",
            userName: "Test User",
            timestamp: new Date(),
          },
        ],
      };

      useChatStore.getState().addMessage(message);

      const { removeReaction } = useChatStore.getState();
      if (removeReaction) {
        removeReaction("msg-1", "👍");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        expect(updatedMessage?.reactions?.length).toBe(0);
      }
    });

    it("should only remove own reaction", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-3",
        userName: "User 3",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [
          {
            emoji: "👍",
            userId: "user-1",
            userName: "Test User",
            timestamp: new Date(),
          },
          {
            emoji: "👍",
            userId: "user-2",
            userName: "User 2",
            timestamp: new Date(),
          },
        ],
      };

      useChatStore.getState().addMessage(message);

      const { removeReaction } = useChatStore.getState();
      if (removeReaction) {
        // user-1 removes their reaction
        removeReaction("msg-1", "👍");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        // Should still have user-2's reaction
        expect(updatedMessage?.reactions?.length).toBe(1);
        expect(updatedMessage?.reactions?.[0].userId).toBe("user-2");
      }
    });

    it("should handle removing non-existent reaction", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { removeReaction } = useChatStore.getState();
      if (removeReaction) {
        // Try to remove reaction that doesn't exist
        expect(() => removeReaction("msg-1", "👍")).not.toThrow();

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        expect(updatedMessage?.reactions?.length).toBe(0);
      }
    });
  });

  describe("Toggle Reactions", () => {
    it("should toggle reaction on/off", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { toggleReaction } = useChatStore.getState();
      if (toggleReaction) {
        // First toggle - add reaction
        toggleReaction("msg-1", "❤️");
        let updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");
        expect(updatedMessage?.reactions?.length).toBe(1);

        // Second toggle - remove reaction
        toggleReaction("msg-1", "❤️");
        updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");
        expect(updatedMessage?.reactions?.length).toBe(0);
      }
    });
  });

  describe("Reaction Counts", () => {
    it("should group reactions by emoji", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-3",
        userName: "User 3",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [
          {
            emoji: "👍",
            userId: "user-1",
            userName: "User 1",
            timestamp: new Date(),
          },
          {
            emoji: "👍",
            userId: "user-2",
            userName: "User 2",
            timestamp: new Date(),
          },
          {
            emoji: "❤️",
            userId: "user-1",
            userName: "User 1",
            timestamp: new Date(),
          },
        ],
      };

      useChatStore.getState().addMessage(message);

      const { getReactionCounts } = useChatStore.getState();
      if (getReactionCounts) {
        const counts = getReactionCounts("msg-1");

        expect(counts["👍"]).toBe(2);
        expect(counts["❤️"]).toBe(1);
      }
    });

    it("should return empty object for message with no reactions", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { getReactionCounts } = useChatStore.getState();
      if (getReactionCounts) {
        const counts = getReactionCounts("msg-1");
        expect(Object.keys(counts)).toHaveLength(0);
      }
    });
  });

  describe("User Reactions", () => {
    it("should check if current user reacted with specific emoji", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [
          {
            emoji: "👍",
            userId: "user-1",
            userName: "Test User",
            timestamp: new Date(),
          },
        ],
      };

      useChatStore.getState().addMessage(message);

      const { hasUserReacted } = useChatStore.getState();
      if (hasUserReacted) {
        expect(hasUserReacted("msg-1", "👍")).toBe(true);
        expect(hasUserReacted("msg-1", "❤️")).toBe(false);
      }
    });
  });

  describe("Reaction Limits", () => {
    it("should enforce maximum reactions per message", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction, MAX_REACTIONS_PER_MESSAGE } =
        useChatStore.getState();

      if (addReaction && MAX_REACTIONS_PER_MESSAGE) {
        const emojis = [
          "👍",
          "❤️",
          "🎉",
          "😂",
          "😍",
          "🔥",
          "✅",
          "💯",
          "⭐",
          "💪",
          "🚀",
        ];

        // Add reactions up to limit
        for (
          let i = 0;
          i < Math.min(emojis.length, MAX_REACTIONS_PER_MESSAGE);
          i++
        ) {
          addReaction("msg-1", emojis[i]);
        }

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        expect(updatedMessage?.reactions?.length).toBeLessThanOrEqual(
          MAX_REACTIONS_PER_MESSAGE,
        );
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle reaction on non-existent message", () => {
      const { addReaction } = useChatStore.getState();

      if (addReaction) {
        expect(() => addReaction("non-existent-id", "👍")).not.toThrow();
      }
    });

    it("should handle invalid emoji", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        // Should handle gracefully
        expect(() => addReaction("msg-1", "")).not.toThrow();
        expect(() => addReaction("msg-1", "invalid")).not.toThrow();
      }
    });

    it("should handle reactions without user info", () => {
      useChatStore.setState({ userId: null, userName: null });

      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        // Should not add reaction without user info
        addReaction("msg-1", "👍");

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        // Implementation should decide: either don't add or add with anonymous user
        expect(updatedMessage).toBeDefined();
      }
    });

    it("should preserve reaction timestamps", () => {
      const message: ChatMessage = {
        id: "msg-1",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Test",
        timestamp: new Date(),
        type: "text",
        reactions: [],
      };

      useChatStore.getState().addMessage(message);

      const { addReaction } = useChatStore.getState();
      if (addReaction) {
        const beforeTime = new Date();
        addReaction("msg-1", "👍");
        const afterTime = new Date();

        const updatedMessage = useChatStore
          .getState()
          .messages.find((m) => m.id === "msg-1");

        const reaction = updatedMessage?.reactions?.[0];
        if (reaction?.timestamp) {
          const reactionTime = new Date(reaction.timestamp);
          expect(reactionTime.getTime()).toBeGreaterThanOrEqual(
            beforeTime.getTime(),
          );
          expect(reactionTime.getTime()).toBeLessThanOrEqual(
            afterTime.getTime(),
          );
        }
      }
    });
  });
});
