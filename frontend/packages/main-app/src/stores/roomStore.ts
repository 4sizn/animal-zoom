/**
 * Room Store - Zustand State Management
 * Manages room lifecycle, participants, and real-time state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { roomsApi } from '@animal-zoom/shared/api';
import type { Room, Participant } from '@animal-zoom/shared/types';
import type {
  RoomInfo,
  ParticipantInfo,
  RoomState,
  UserJoinState,
  ParticipantStatus,
  CreateRoomRequest,
  JoinRoomRequest,
} from '@/types/room';

interface RoomStore {
  // Room state
  room: RoomInfo | null;
  setRoom: (room: RoomInfo) => void;
  updateRoomState: (state: RoomState) => void;

  // Current user state
  currentUser: ParticipantInfo | null;
  setCurrentUser: (user: ParticipantInfo) => void;
  updateUserJoinState: (state: UserJoinState) => void;
  updateUserStatus: (status: ParticipantStatus) => void;

  // Participants
  participants: ParticipantInfo[];
  setParticipants: (participants: ParticipantInfo[]) => void;
  addParticipant: (participant: ParticipantInfo) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipantStatus: (participantId: string, status: ParticipantStatus) => void;
  updateParticipantJoinState: (participantId: string, state: UserJoinState) => void;

  // Waiting room
  waitingParticipants: ParticipantInfo[];
  addToWaitingRoom: (participant: ParticipantInfo) => void;
  removeFromWaitingRoom: (participantId: string) => void;
  admitParticipant: (participantId: string) => Promise<void>;
  rejectParticipant: (participantId: string) => Promise<void>;

  // Actions
  createRoom: (request: CreateRoomRequest) => Promise<void>;
  startRoom: () => void;
  endRoom: () => Promise<void>;
  joinRoom: (roomCode: string, request: JoinRoomRequest) => Promise<void>;
  leaveRoom: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

// Helper function to convert API Room to RoomInfo
function roomToRoomInfo(room: Room, hostName: string): RoomInfo {
  return {
    id: room.id,
    code: room.code,
    hostId: room.id, // Assuming room creator is host
    hostName: hostName,
    title: room.name || 'Quick Room',
    state: 'CREATED', // Initial state
    createdAt: room.createdAt,
    waitingRoomEnabled: true, // Default
  };
}

// Helper function to convert API Participant to ParticipantInfo
function participantToParticipantInfo(participant: Participant, isHost: boolean): ParticipantInfo {
  return {
    id: participant.id,
    name: participant.displayName,
    joinState: 'JOINED',
    status: 'PRESENT',
    isHost: isHost,
    joinedAt: new Date(),
  };
}

export const useRoomStore = create<RoomStore>()(
  persist(
    devtools(
      (set, get) => ({
      // Initial state
      room: null,
      currentUser: null,
      participants: [],
      waitingParticipants: [],
      isLoading: false,
      error: null,

      // Room setters
      setRoom: (room) => set({ room }),

      updateRoomState: (state) =>
        set((prev) => ({
          room: prev.room ? { ...prev.room, state } : null,
        })),

      // Current user setters
      setCurrentUser: (user) => set({ currentUser: user }),

      updateUserJoinState: (state) =>
        set((prev) => ({
          currentUser: prev.currentUser ? { ...prev.currentUser, joinState: state } : null,
        })),

      updateUserStatus: (status) =>
        set((prev) => ({
          currentUser: prev.currentUser ? { ...prev.currentUser, status } : null,
        })),

      // Participants management
      setParticipants: (participants) => set({ participants }),

      addParticipant: (participant) =>
        set((prev) => ({
          participants: [...prev.participants, participant],
        })),

      removeParticipant: (participantId) =>
        set((prev) => ({
          participants: prev.participants.filter((p) => p.id !== participantId),
        })),

      updateParticipantStatus: (participantId, status) =>
        set((prev) => ({
          participants: prev.participants.map((p) =>
            p.id === participantId ? { ...p, status } : p
          ),
        })),

      updateParticipantJoinState: (participantId, state) =>
        set((prev) => ({
          participants: prev.participants.map((p) =>
            p.id === participantId ? { ...p, joinState: state } : p
          ),
        })),

      // Waiting room management
      addToWaitingRoom: (participant) =>
        set((prev) => ({
          waitingParticipants: [...prev.waitingParticipants, participant],
        })),

      removeFromWaitingRoom: (participantId) =>
        set((prev) => ({
          waitingParticipants: prev.waitingParticipants.filter((p) => p.id !== participantId),
        })),

      admitParticipant: async (participantId) => {
        // TODO: Implement API call for admission
        // For now, just move from waiting to participants
        const participant = get().waitingParticipants.find((p) => p.id === participantId);
        if (participant) {
          get().removeFromWaitingRoom(participantId);
          get().addParticipant({ ...participant, joinState: 'JOINED' });
        }
      },

      rejectParticipant: async (participantId) => {
        // TODO: Implement API call for rejection
        get().removeFromWaitingRoom(participantId);
      },

      // Actions
      createRoom: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const room = await roomsApi.createRoom({
            name: request.title || 'Quick Room',
          });

          const roomInfo: RoomInfo = roomToRoomInfo(room, 'Me'); // TODO: Get actual user name

          // Set current user as host
          const hostUser: ParticipantInfo = {
            id: room.id,
            name: 'Me', // TODO: Get actual user name
            joinState: 'PREVIEW',
            status: 'PRESENT',
            isHost: true,
          };

          set({
            room: roomInfo,
            currentUser: hostUser,
            participants: [hostUser],
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      startRoom: () => {
        get().updateRoomState('LIVE');
        get().updateUserJoinState('JOINED');
      },

      endRoom: async () => {
        const room = get().room;
        if (!room) return;

        set({ isLoading: true, error: null });
        try {
          await roomsApi.deleteRoom(room.code);
          get().updateRoomState('ENDED');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to end room';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      joinRoom: async (roomCode, request) => {
        set({ isLoading: true, error: null });
        try {
          // Get room info with participants
          const roomData = await roomsApi.getRoom(roomCode);
          console.log('Got room data:', roomData);

          // Join the room
          const joinResult = await roomsApi.joinRoom(roomCode, {
            displayName: request.userName,
          });
          console.log('Joined room result:', joinResult);

          const roomInfo: RoomInfo = roomToRoomInfo(roomData.room, 'Host'); // TODO: Get actual host name

          // Set current user with actual isHost from API response
          const currentUser: ParticipantInfo = {
            id: joinResult.room.id,
            name: request.userName,
            joinState: 'PREVIEW',
            status: 'PRESENT',
            isHost: joinResult.isHost,
            joinedAt: new Date(),
          };

          // Convert existing participants to ParticipantInfo
          const existingParticipants: ParticipantInfo[] = roomData.participants.map((p) =>
            participantToParticipantInfo(p, p.id === roomData.room.id)
          );

          console.log('Setting room store:', {
            room: roomInfo,
            currentUser,
            isHost: currentUser.isHost,
            participants: existingParticipants,
          });

          set({
            room: roomInfo,
            currentUser,
            participants: existingParticipants,
            isLoading: false,
          });
        } catch (error) {
          console.error('joinRoom error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      leaveRoom: async () => {
        const room = get().room;
        if (!room) return;

        set({ isLoading: true, error: null });
        try {
          await roomsApi.leaveRoom(room.code);
          get().updateUserJoinState('LEFT');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to leave room';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Error management
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset state
      reset: () =>
        set({
          room: null,
          currentUser: null,
          participants: [],
          waitingParticipants: [],
          isLoading: false,
          error: null,
        }),
    }),
    { name: 'room-store' }
  ),
  {
    name: 'room-storage',
    partialize: (state) => ({
      room: state.room,
      currentUser: state.currentUser,
      participants: state.participants,
    }),
  }
));
