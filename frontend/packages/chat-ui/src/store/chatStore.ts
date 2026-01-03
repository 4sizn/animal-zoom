/**
 * Chat Store - Zustand State Management
 * Manages chat messages, participants, and UI state with WebSocket integration
 */

import { create } from 'zustand';
import { WebSocketClientController } from '@animal-zoom/shared/socket';
import type { ChatMessage } from '@animal-zoom/shared/types';
import type { ConnectionState } from '@animal-zoom/shared/socket';

// Create WebSocket controller instance (singleton)
const wsController = new WebSocketClientController({
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
  inputValue: '',
  setInputValue: (inputValue) => set({ inputValue }),

  // Room info
  roomId: null,
  setRoomId: (roomId) => set({ roomId }),

  // Current user
  userId: null,
  userName: null,
  setUser: (userId, userName) => set({ userId, userName }),

  // WebSocket
  connectionState: 'disconnected',

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
}));

// Subscribe to WebSocket events and update store
wsController.connectionState$.subscribe((state: ConnectionState) => {
  useChatStore.setState({ connectionState: state });
});

wsController.chatMessage$.subscribe((data: any) => {
  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random()}`,
    roomId: data.roomId || useChatStore.getState().roomId || '',
    userId: data.senderId,
    userName: data.senderName,
    message: data.message,
    timestamp: new Date(data.timestamp || Date.now()),
    type: 'text',
  };

  useChatStore.getState().addMessage(message);
});

// Export WebSocket controller for advanced use cases
export { wsController };
