/**
 * Room Store Unit Tests
 * Tests for Zustand room state management
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ParticipantInfo, RoomInfo } from "@/types/room";
import { useRoomStore } from "../roomStore";

// Mock @animal-zoom/shared/api
vi.mock("@animal-zoom/shared/api", () => ({
  roomsApi: {
    createRoom: vi.fn(),
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    deleteRoom: vi.fn(),
  },
}));

describe("RoomStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useRoomStore.getState().reset();
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have null room initially", () => {
      const { room } = useRoomStore.getState();
      expect(room).toBeNull();
    });

    it("should have null currentUser initially", () => {
      const { currentUser } = useRoomStore.getState();
      expect(currentUser).toBeNull();
    });

    it("should have empty participants array", () => {
      const { participants } = useRoomStore.getState();
      expect(participants).toEqual([]);
    });

    it("should have empty waiting room", () => {
      const { waitingParticipants } = useRoomStore.getState();
      expect(waitingParticipants).toEqual([]);
    });

    it("should not be loading", () => {
      const { isLoading } = useRoomStore.getState();
      expect(isLoading).toBe(false);
    });

    it("should have no error", () => {
      const { error } = useRoomStore.getState();
      expect(error).toBeNull();
    });
  });

  describe("Room State Updates", () => {
    it("should update room state", () => {
      const mockRoom: RoomInfo = {
        id: "1",
        code: "ABC123",
        hostId: "host-1",
        hostName: "Host User",
        title: "Test Room",
        state: "CREATED",
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useRoomStore.getState().setRoom(mockRoom);
      const { room } = useRoomStore.getState();
      expect(room).toEqual(mockRoom);
    });

    it("should transition room state from CREATED to LIVE", () => {
      const mockRoom: RoomInfo = {
        id: "1",
        code: "ABC123",
        hostId: "host-1",
        hostName: "Host User",
        title: "Test Room",
        state: "CREATED",
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useRoomStore.getState().setRoom(mockRoom);
      useRoomStore.getState().updateRoomState("LIVE");

      const { room } = useRoomStore.getState();
      expect(room?.state).toBe("LIVE");
    });

    it("should transition room state from LIVE to ENDED", () => {
      const mockRoom: RoomInfo = {
        id: "1",
        code: "ABC123",
        hostId: "host-1",
        hostName: "Host User",
        title: "Test Room",
        state: "LIVE",
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useRoomStore.getState().setRoom(mockRoom);
      useRoomStore.getState().updateRoomState("ENDED");

      const { room } = useRoomStore.getState();
      expect(room?.state).toBe("ENDED");
    });
  });

  describe("Current User State", () => {
    it("should set current user", () => {
      const mockUser: ParticipantInfo = {
        id: "user-1",
        name: "Test User",
        joinState: "PREVIEW",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().setCurrentUser(mockUser);
      const { currentUser } = useRoomStore.getState();
      expect(currentUser).toEqual(mockUser);
    });

    it("should update user join state", () => {
      const mockUser: ParticipantInfo = {
        id: "user-1",
        name: "Test User",
        joinState: "PREVIEW",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().setCurrentUser(mockUser);
      useRoomStore.getState().updateUserJoinState("WAITING");

      const { currentUser } = useRoomStore.getState();
      expect(currentUser?.joinState).toBe("WAITING");
    });

    it("should update user status", () => {
      const mockUser: ParticipantInfo = {
        id: "user-1",
        name: "Test User",
        joinState: "JOINED",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().setCurrentUser(mockUser);
      useRoomStore.getState().updateUserStatus("AWAY");

      const { currentUser } = useRoomStore.getState();
      expect(currentUser?.status).toBe("AWAY");
    });
  });

  describe("Participants Management", () => {
    it("should add participant", () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Participant 1",
        joinState: "JOINED",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addParticipant(participant);
      const { participants } = useRoomStore.getState();
      expect(participants).toHaveLength(1);
      expect(participants[0]).toEqual(participant);
    });

    it("should remove participant", () => {
      const participant1: ParticipantInfo = {
        id: "p-1",
        name: "Participant 1",
        joinState: "JOINED",
        status: "PRESENT",
        isHost: false,
      };
      const participant2: ParticipantInfo = {
        id: "p-2",
        name: "Participant 2",
        joinState: "JOINED",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addParticipant(participant1);
      useRoomStore.getState().addParticipant(participant2);
      useRoomStore.getState().removeParticipant("p-1");

      const { participants } = useRoomStore.getState();
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe("p-2");
    });

    it("should update participant status", () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Participant 1",
        joinState: "JOINED",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addParticipant(participant);
      useRoomStore.getState().updateParticipantStatus("p-1", "AWAY");

      const { participants } = useRoomStore.getState();
      expect(participants[0].status).toBe("AWAY");
    });

    it("should update participant join state", () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Participant 1",
        joinState: "WAITING",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addParticipant(participant);
      useRoomStore.getState().updateParticipantJoinState("p-1", "JOINED");

      const { participants } = useRoomStore.getState();
      expect(participants[0].joinState).toBe("JOINED");
    });
  });

  describe("Waiting Room Management", () => {
    it("should add participant to waiting room", () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Waiting Participant",
        joinState: "WAITING",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addToWaitingRoom(participant);
      const { waitingParticipants } = useRoomStore.getState();
      expect(waitingParticipants).toHaveLength(1);
      expect(waitingParticipants[0]).toEqual(participant);
    });

    it("should remove participant from waiting room", () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Waiting Participant",
        joinState: "WAITING",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addToWaitingRoom(participant);
      useRoomStore.getState().removeFromWaitingRoom("p-1");

      const { waitingParticipants } = useRoomStore.getState();
      expect(waitingParticipants).toHaveLength(0);
    });

    it("should admit participant (move from waiting to participants)", async () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Waiting Participant",
        joinState: "WAITING",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addToWaitingRoom(participant);
      await useRoomStore.getState().admitParticipant("p-1");

      const { waitingParticipants, participants } = useRoomStore.getState();
      expect(waitingParticipants).toHaveLength(0);
      expect(participants).toHaveLength(1);
      expect(participants[0].joinState).toBe("JOINED");
    });

    it("should reject participant (remove from waiting)", async () => {
      const participant: ParticipantInfo = {
        id: "p-1",
        name: "Waiting Participant",
        joinState: "WAITING",
        status: "PRESENT",
        isHost: false,
      };

      useRoomStore.getState().addToWaitingRoom(participant);
      await useRoomStore.getState().rejectParticipant("p-1");

      const { waitingParticipants } = useRoomStore.getState();
      expect(waitingParticipants).toHaveLength(0);
    });
  });

  describe("Start Room Action", () => {
    it("should transition room to LIVE and user to JOINED", () => {
      const mockRoom: RoomInfo = {
        id: "1",
        code: "ABC123",
        hostId: "host-1",
        hostName: "Host User",
        title: "Test Room",
        state: "CREATED",
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      const mockUser: ParticipantInfo = {
        id: "host-1",
        name: "Host User",
        joinState: "PREVIEW",
        status: "PRESENT",
        isHost: true,
      };

      useRoomStore.getState().setRoom(mockRoom);
      useRoomStore.getState().setCurrentUser(mockUser);
      useRoomStore.getState().startRoom();

      const { room, currentUser } = useRoomStore.getState();
      expect(room?.state).toBe("LIVE");
      expect(currentUser?.joinState).toBe("JOINED");
    });
  });

  describe("Error Management", () => {
    it("should set error", () => {
      useRoomStore.getState().setError("Test error");
      const { error } = useRoomStore.getState();
      expect(error).toBe("Test error");
    });

    it("should clear error", () => {
      useRoomStore.getState().setError("Test error");
      useRoomStore.getState().clearError();
      const { error } = useRoomStore.getState();
      expect(error).toBeNull();
    });
  });

  describe("Reset Action", () => {
    it("should reset all state to initial values", () => {
      // Set some state
      const mockRoom: RoomInfo = {
        id: "1",
        code: "ABC123",
        hostId: "host-1",
        hostName: "Host User",
        title: "Test Room",
        state: "LIVE",
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      useRoomStore.getState().setRoom(mockRoom);
      useRoomStore.getState().setError("Test error");

      // Reset
      useRoomStore.getState().reset();

      const state = useRoomStore.getState();
      expect(state.room).toBeNull();
      expect(state.currentUser).toBeNull();
      expect(state.participants).toEqual([]);
      expect(state.waitingParticipants).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
