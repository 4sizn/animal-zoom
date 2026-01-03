/**
 * Meeting Store Unit Tests
 * Tests for Zustand meeting state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMeetingStore } from '../meetingStore';
import type { MeetingInfo, ParticipantInfo } from '@/types/meeting';

// Mock @animal-zoom/shared/api
vi.mock('@animal-zoom/shared/api', () => ({
  roomsApi: {
    createRoom: vi.fn(),
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    deleteRoom: vi.fn(),
  },
}));

describe('MeetingStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMeetingStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null meeting initially', () => {
      const { meeting } = useMeetingStore.getState();
      expect(meeting).toBeNull();
    });

    it('should have null currentUser initially', () => {
      const { currentUser } = useMeetingStore.getState();
      expect(currentUser).toBeNull();
    });

    it('should have empty participants array', () => {
      const { participants } = useMeetingStore.getState();
      expect(participants).toEqual([]);
    });

    it('should have empty waiting room', () => {
      const { waitingParticipants } = useMeetingStore.getState();
      expect(waitingParticipants).toEqual([]);
    });

    it('should not be loading', () => {
      const { isLoading } = useMeetingStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should have no error', () => {
      const { error } = useMeetingStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('Meeting State Updates', () => {
    it('should update meeting state', () => {
      const mockMeeting: MeetingInfo = {
        id: '1',
        code: 'ABC123',
        hostId: 'host-1',
        hostName: 'Host User',
        title: 'Test Meeting',
        state: 'CREATED',
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useMeetingStore.getState().setMeeting(mockMeeting);
      const { meeting } = useMeetingStore.getState();
      expect(meeting).toEqual(mockMeeting);
    });

    it('should transition meeting state from CREATED to LIVE', () => {
      const mockMeeting: MeetingInfo = {
        id: '1',
        code: 'ABC123',
        hostId: 'host-1',
        hostName: 'Host User',
        title: 'Test Meeting',
        state: 'CREATED',
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useMeetingStore.getState().setMeeting(mockMeeting);
      useMeetingStore.getState().updateMeetingState('LIVE');

      const { meeting } = useMeetingStore.getState();
      expect(meeting?.state).toBe('LIVE');
    });

    it('should transition meeting state from LIVE to ENDED', () => {
      const mockMeeting: MeetingInfo = {
        id: '1',
        code: 'ABC123',
        hostId: 'host-1',
        hostName: 'Host User',
        title: 'Test Meeting',
        state: 'LIVE',
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useMeetingStore.getState().setMeeting(mockMeeting);
      useMeetingStore.getState().updateMeetingState('ENDED');

      const { meeting } = useMeetingStore.getState();
      expect(meeting?.state).toBe('ENDED');
    });
  });

  describe('Current User State', () => {
    it('should set current user', () => {
      const mockUser: ParticipantInfo = {
        id: 'user-1',
        name: 'Test User',
        joinState: 'PREVIEW',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().setCurrentUser(mockUser);
      const { currentUser } = useMeetingStore.getState();
      expect(currentUser).toEqual(mockUser);
    });

    it('should update user join state', () => {
      const mockUser: ParticipantInfo = {
        id: 'user-1',
        name: 'Test User',
        joinState: 'PREVIEW',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().setCurrentUser(mockUser);
      useMeetingStore.getState().updateUserJoinState('WAITING');

      const { currentUser } = useMeetingStore.getState();
      expect(currentUser?.joinState).toBe('WAITING');
    });

    it('should update user status', () => {
      const mockUser: ParticipantInfo = {
        id: 'user-1',
        name: 'Test User',
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().setCurrentUser(mockUser);
      useMeetingStore.getState().updateUserStatus('AWAY');

      const { currentUser } = useMeetingStore.getState();
      expect(currentUser?.status).toBe('AWAY');
    });
  });

  describe('Participants Management', () => {
    it('should add participant', () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Participant 1',
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addParticipant(participant);
      const { participants } = useMeetingStore.getState();
      expect(participants).toHaveLength(1);
      expect(participants[0]).toEqual(participant);
    });

    it('should remove participant', () => {
      const participant1: ParticipantInfo = {
        id: 'p-1',
        name: 'Participant 1',
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
      };
      const participant2: ParticipantInfo = {
        id: 'p-2',
        name: 'Participant 2',
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addParticipant(participant1);
      useMeetingStore.getState().addParticipant(participant2);
      useMeetingStore.getState().removeParticipant('p-1');

      const { participants } = useMeetingStore.getState();
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe('p-2');
    });

    it('should update participant status', () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Participant 1',
        joinState: 'JOINED',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addParticipant(participant);
      useMeetingStore.getState().updateParticipantStatus('p-1', 'AWAY');

      const { participants } = useMeetingStore.getState();
      expect(participants[0].status).toBe('AWAY');
    });

    it('should update participant join state', () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Participant 1',
        joinState: 'WAITING',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addParticipant(participant);
      useMeetingStore.getState().updateParticipantJoinState('p-1', 'JOINED');

      const { participants } = useMeetingStore.getState();
      expect(participants[0].joinState).toBe('JOINED');
    });
  });

  describe('Waiting Room Management', () => {
    it('should add participant to waiting room', () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Waiting Participant',
        joinState: 'WAITING',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addToWaitingRoom(participant);
      const { waitingParticipants } = useMeetingStore.getState();
      expect(waitingParticipants).toHaveLength(1);
      expect(waitingParticipants[0]).toEqual(participant);
    });

    it('should remove participant from waiting room', () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Waiting Participant',
        joinState: 'WAITING',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addToWaitingRoom(participant);
      useMeetingStore.getState().removeFromWaitingRoom('p-1');

      const { waitingParticipants } = useMeetingStore.getState();
      expect(waitingParticipants).toHaveLength(0);
    });

    it('should admit participant (move from waiting to participants)', async () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Waiting Participant',
        joinState: 'WAITING',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addToWaitingRoom(participant);
      await useMeetingStore.getState().admitParticipant('p-1');

      const { waitingParticipants, participants } = useMeetingStore.getState();
      expect(waitingParticipants).toHaveLength(0);
      expect(participants).toHaveLength(1);
      expect(participants[0].joinState).toBe('JOINED');
    });

    it('should reject participant (remove from waiting)', async () => {
      const participant: ParticipantInfo = {
        id: 'p-1',
        name: 'Waiting Participant',
        joinState: 'WAITING',
        status: 'PRESENT',
        isHost: false,
      };

      useMeetingStore.getState().addToWaitingRoom(participant);
      await useMeetingStore.getState().rejectParticipant('p-1');

      const { waitingParticipants } = useMeetingStore.getState();
      expect(waitingParticipants).toHaveLength(0);
    });
  });

  describe('Start Meeting Action', () => {
    it('should transition meeting to LIVE and user to JOINED', () => {
      const mockMeeting: MeetingInfo = {
        id: '1',
        code: 'ABC123',
        hostId: 'host-1',
        hostName: 'Host User',
        title: 'Test Meeting',
        state: 'CREATED',
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      const mockUser: ParticipantInfo = {
        id: 'host-1',
        name: 'Host User',
        joinState: 'PREVIEW',
        status: 'PRESENT',
        isHost: true,
      };

      useMeetingStore.getState().setMeeting(mockMeeting);
      useMeetingStore.getState().setCurrentUser(mockUser);
      useMeetingStore.getState().startMeeting();

      const { meeting, currentUser } = useMeetingStore.getState();
      expect(meeting?.state).toBe('LIVE');
      expect(currentUser?.joinState).toBe('JOINED');
    });
  });

  describe('Error Management', () => {
    it('should set error', () => {
      useMeetingStore.getState().setError('Test error');
      const { error } = useMeetingStore.getState();
      expect(error).toBe('Test error');
    });

    it('should clear error', () => {
      useMeetingStore.getState().setError('Test error');
      useMeetingStore.getState().clearError();
      const { error } = useMeetingStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('Reset Action', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      const mockMeeting: MeetingInfo = {
        id: '1',
        code: 'ABC123',
        hostId: 'host-1',
        hostName: 'Host User',
        title: 'Test Meeting',
        state: 'LIVE',
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useMeetingStore.getState().setMeeting(mockMeeting);
      useMeetingStore.getState().setError('Test error');

      // Reset
      useMeetingStore.getState().reset();

      const state = useMeetingStore.getState();
      expect(state.meeting).toBeNull();
      expect(state.currentUser).toBeNull();
      expect(state.participants).toEqual([]);
      expect(state.waitingParticipants).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
