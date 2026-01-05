/**
 * Chat Store - Zustand State Management
 * Manages chat messages, participants, and UI state with WebSocket integration
 */

import type { ConnectionState } from "@animal-zoom/shared/socket";
import { getInstance as getWebSocketController } from "@animal-zoom/shared/socket";
import type { ChatMessage } from "@animal-zoom/shared/types";
import { create } from "zustand";

// Use the shared singleton WebSocket controller instance
const wsController = getWebSocketController({
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

export interface ChatState {
  // Messages
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // UI State
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleChat: () => void;

  // Input
  inputValue: string;
  setInputValue: (value: string) => void;

  // Room info
  roomId: string | null;
  setRoomId: (roomId: string) => void;

  // Current user
  userId: string | null;
  userName: string | null;
  setUser: (userId: string, userName: string) => void;

  // WebSocket
  connectionState: ConnectionState;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  joinRoom: (roomCode: string) => void;
  sendMessage: (message: string) => void;

  // Reactions
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  getReactionCounts: (messageId: string) => Record<string, number>;
  hasUserReacted: (messageId: string, emoji: string) => boolean;
  MAX_REACTIONS_PER_MESSAGE: number;
}

export const useChatStore = create<ChatState>((set) => ({
  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),

  // UI State
  isOpen: true,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  // Input
  inputValue: "",
  setInputValue: (inputValue) => set({ inputValue }),

  // Room info
  roomId: null,
  setRoomId: (roomId) => set({ roomId }),

  // Current user
  userId: null,
  userName: null,
  setUser: (userId, userName) => set({ userId, userName }),

  // WebSocket
  connectionState: "disconnected",

  connectWebSocket: () => {
    wsController.connect();
  },

  disconnectWebSocket: () => {
    wsController.disconnect();
  },

  joinRoom: (roomCode: string) => {
    wsController.joinRoom(roomCode);
    set({ roomId: roomCode });
  },

  sendMessage: (message: string) => {
    wsController.sendChatMessage(message);
  },

  // Reactions
  MAX_REACTIONS_PER_MESSAGE: 50,

  addReaction: (messageId: string, emoji: string) => {
    set((state) => {
      const { userId, userName } = state;

      // Require user info
      if (!userId || !userName) {
        console.warn("Cannot add reaction: user info missing");
        return state;
      }

      // Validate emoji
      if (!emoji || typeof emoji !== "string") {
        console.warn("Cannot add reaction: invalid emoji");
        return state;
      }

      const messages = state.messages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = msg.reactions || [];

        // Check if user already reacted with this emoji
        const hasReacted = reactions.some(
          (r) => r.userId === userId && r.emoji === emoji,
        );

        if (hasReacted) {
          return msg; // Don't add duplicate
        }

        // Check max reactions limit
        if (reactions.length >= state.MAX_REACTIONS_PER_MESSAGE) {
          console.warn("Cannot add reaction: max reactions reached");
          return msg;
        }

        // Add new reaction
        const newReaction = {
          emoji,
          userId,
          userName,
          timestamp: new Date(),
        };

        return {
          ...msg,
          reactions: [...reactions, newReaction],
        };
      });

      return { messages };
    });
  },

  removeReaction: (messageId: string, emoji: string) => {
    set((state) => {
      const { userId } = state;

      if (!userId) {
        console.warn("Cannot remove reaction: user info missing");
        return state;
      }

      const messages = state.messages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = (msg.reactions || []).filter(
          (r) => !(r.userId === userId && r.emoji === emoji),
        );

        return {
          ...msg,
          reactions,
        };
      });

      return { messages };
    });
  },

  toggleReaction: (messageId: string, emoji: string) => {
    const state = useChatStore.getState();
    const hasReacted = state.hasUserReacted(messageId, emoji);

    if (hasReacted) {
      state.removeReaction(messageId, emoji);
    } else {
      state.addReaction(messageId, emoji);
    }
  },

  getReactionCounts: (messageId: string) => {
    const state = useChatStore.getState();
    const message = state.messages.find((m) => m.id === messageId);

    if (!message || !message.reactions) {
      return {};
    }

    const counts: Record<string, number> = {};

    for (const reaction of message.reactions) {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    }

    return counts;
  },

  hasUserReacted: (messageId: string, emoji: string) => {
    const state = useChatStore.getState();
    const { userId } = state;

    if (!userId) return false;

    const message = state.messages.find((m) => m.id === messageId);

    if (!message || !message.reactions) {
      return false;
    }

    return message.reactions.some(
      (r) => r.userId === userId && r.emoji === emoji,
    );
  },
}));

// Subscribe to WebSocket events and update store
wsController.connectionState$.subscribe((state: ConnectionState) => {
  useChatStore.setState({ connectionState: state });
});

// Handle room joined - load message history
wsController.roomJoined$.subscribe((data: any) => {
  console.log("[ChatStore] Room joined, loading message history");

  // Clear existing messages
  useChatStore.getState().clearMessages();

  // Load message history if provided
  if (data.messages && Array.isArray(data.messages)) {
    const messages: ChatMessage[] = data.messages.map((msg: any) => ({
      id: msg.id,
      roomId: msg.roomId,
      userId: msg.userId,
      userName: msg.username || "Unknown User",
      message: msg.content,
      timestamp: new Date(msg.createdAt),
      type: "text",
    }));

    // Add all historical messages
    messages.forEach((msg) => useChatStore.getState().addMessage(msg));

    console.log(`[ChatStore] Loaded ${messages.length} historical messages`);
  }
});

// Handle incoming real-time messages
wsController.chatMessage$.subscribe((data: any) => {
  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random()}`,
    roomId: data.roomId || useChatStore.getState().roomId || "",
    userId: data.senderId,
    userName: data.senderName,
    message: data.message,
    timestamp: new Date(data.timestamp || Date.now()),
    type: "text",
  };

  useChatStore.getState().addMessage(message);
});

// Export WebSocket controller for advanced use cases
export { wsController };
