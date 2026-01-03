/**
 * Meeting Store - Zustand State Management
 * Manages meeting lifecycle, participants, and real-time state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { roomsApi } from '@animal-zoom/shared/api';
import type { Room, Participant } from '@animal-zoom/shared/types';
import type {
  MeetingInfo,
  ParticipantInfo,
  MeetingState,
  UserJoinState,
  ParticipantStatus,
  CreateMeetingRequest,
  JoinMeetingRequest,
} from '@/types/meeting';

interface MeetingStore {
  // Meeting state
  meeting: MeetingInfo | null;
  setMeeting: (meeting: MeetingInfo) => void;
  updateMeetingState: (state: MeetingState) => void;

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
  createMeeting: (request: CreateMeetingRequest) => Promise<void>;
  startMeeting: () => void;
  endMeeting: () => Promise<void>;
  joinMeeting: (meetingCode: string, request: JoinMeetingRequest) => Promise<void>;
  leaveMeeting: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

// Helper function to convert API Room to MeetingInfo
function roomToMeetingInfo(room: Room, hostName: string): MeetingInfo {
  return {
    id: room.id,
    code: room.code,
    hostId: room.id, // Assuming room creator is host
    hostName: hostName,
    title: room.name || 'Quick Meeting',
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

export const useMeetingStore = create<MeetingStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      meeting: null,
      currentUser: null,
      participants: [],
      waitingParticipants: [],
      isLoading: false,
      error: null,

      // Meeting setters
      setMeeting: (meeting) => set({ meeting }),

      updateMeetingState: (state) =>
        set((prev) => ({
          meeting: prev.meeting ? { ...prev.meeting, state } : null,
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
      createMeeting: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const room = await roomsApi.createRoom({
            name: request.title || 'Quick Meeting',
          });

          const meeting: MeetingInfo = roomToMeetingInfo(room, 'Me'); // TODO: Get actual user name

          // Set current user as host
          const hostUser: ParticipantInfo = {
            id: room.id,
            name: 'Me', // TODO: Get actual user name
            joinState: 'PREVIEW',
            status: 'PRESENT',
            isHost: true,
          };

          set({
            meeting,
            currentUser: hostUser,
            participants: [hostUser],
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      startMeeting: () => {
        get().updateMeetingState('LIVE');
        get().updateUserJoinState('JOINED');
      },

      endMeeting: async () => {
        const meeting = get().meeting;
        if (!meeting) return;

        set({ isLoading: true, error: null });
        try {
          await roomsApi.deleteRoom(meeting.code);
          get().updateMeetingState('ENDED');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to end meeting';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      joinMeeting: async (meetingCode, request) => {
        set({ isLoading: true, error: null });
        try {
          // Get meeting info
          const room = await roomsApi.getRoom(meetingCode);

          // Join the room
          const participant = await roomsApi.joinRoom(meetingCode, {
            displayName: request.userName,
          });

          const meeting: MeetingInfo = roomToMeetingInfo(room, 'Host'); // TODO: Get actual host name

          // Set current user
          const currentUser: ParticipantInfo = participantToParticipantInfo(participant, false);
          currentUser.joinState = 'PREVIEW'; // Start in preview state

          set({
            meeting,
            currentUser,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to join meeting';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      leaveMeeting: async () => {
        const meeting = get().meeting;
        if (!meeting) return;

        set({ isLoading: true, error: null });
        try {
          await roomsApi.leaveRoom(meeting.code);
          get().updateUserJoinState('LEFT');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to leave meeting';
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
          meeting: null,
          currentUser: null,
          participants: [],
          waitingParticipants: [],
          isLoading: false,
          error: null,
        }),
    }),
    { name: 'meeting-store' }
  )
);
