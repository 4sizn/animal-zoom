/**
 * Chat Store - Zustand State Management
 * Manages chat messages, participants, and UI state
 */

import { create } from 'zustand';
import type { ChatMessage } from '@animal-zoom/shared/types';

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
}));
