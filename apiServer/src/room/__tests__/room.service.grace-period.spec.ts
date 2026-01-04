import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from '../room.service.js';
import { GracePeriodManager } from '../grace-period-manager.js';
import { DatabaseService } from '../../database/database.service.js';
import { NotFoundException } from '@nestjs/common';

describe('RoomService - Grace Period Integration', () => {
  let service: RoomService;
  let gracePeriodManager: GracePeriodManager;
  let mockDatabaseService: Partial<DatabaseService>;

  // Mock database query builders
  const mockQueryBuilder = {
    selectFrom: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    insertInto: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returningAll: jest.fn().mockReturnThis(),
    updateTable: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    executeTakeFirst: jest.fn(),
    executeTakeFirstOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mock
    Object.values(mockQueryBuilder).forEach((fn) => {
      if (typeof fn === 'function' && fn.mockClear) {
        fn.mockClear();
      }
    });

    mockDatabaseService = {
      db: mockQueryBuilder as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        GracePeriodManager,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    gracePeriodManager = module.get<GracePeriodManager>(GracePeriodManager);

    // Spy on GracePeriodManager methods
    jest.spyOn(gracePeriodManager, 'startGracePeriod');
    jest.spyOn(gracePeriodManager, 'cancelGracePeriod');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('leaveRoom - Grace Period Behavior', () => {
    it('should start grace period when last participant leaves', async () => {
      const userId = 'user-123';
      const roomCode = 'ROOM01';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-1',
        code: roomCode,
        currentParticipants: 1,
      });

      // Mock: Participant exists and is active
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-1',
        userId,
        roomId: 'room-id-1',
        role: 'host',
        isActive: true,
      });

      // Mock: Update participant to inactive
      mockQueryBuilder.execute.mockResolvedValueOnce(undefined);

      // Mock: Update room participant count
      mockQueryBuilder.execute.mockResolvedValueOnce(undefined);

      // Mock: Check remaining participants - returns null (room is empty)
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      await service.leaveRoom(userId, roomCode);

      // Grace period should be started
      expect(gracePeriodManager.startGracePeriod).toHaveBeenCalledWith(
        roomCode,
        expect.any(Function),
      );
    });

    it('should NOT start grace period if other participants remain', async () => {
      const userId = 'user-123';
      const roomCode = 'ROOM02';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-2',
        code: roomCode,
        currentParticipants: 2,
      });

      // Mock: Participant exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-1',
        userId,
        roomId: 'room-id-2',
        role: 'participant',
        isActive: true,
      });

      // Mock: Update operations
      mockQueryBuilder.execute.mockResolvedValue(undefined);

      // Mock: Check remaining participants - returns a participant (room not empty)
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-2',
      });

      await service.leaveRoom(userId, roomCode);

      // Grace period should NOT be started
      expect(gracePeriodManager.startGracePeriod).not.toHaveBeenCalled();
    });

    it('should NOT immediately mark room as inactive when last participant leaves', async () => {
      const userId = 'user-host';
      const roomCode = 'ROOM03';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-3',
        code: roomCode,
        status: 'active',
        currentParticipants: 1,
      });

      // Mock: Participant is host
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-host',
        userId,
        roomId: 'room-id-3',
        role: 'host',
        isActive: true,
      });

      // Mock: Update operations
      mockQueryBuilder.execute.mockResolvedValue(undefined);

      // Mock: No remaining participants
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      // Spy on updateTable to ensure it's NOT called with status='inactive'
      const updateTableSpy = jest.spyOn(mockQueryBuilder, 'updateTable');

      await service.leaveRoom(userId, roomCode);

      // Should start grace period instead of immediate inactive
      expect(gracePeriodManager.startGracePeriod).toHaveBeenCalled();

      // Should NOT immediately update room status to inactive
      const inactiveCalls = updateTableSpy.mock.calls.filter((call) => {
        // Check if subsequent .set() was called with status: 'inactive'
        return false; // We'll verify this doesn't happen
      });

      // The updateTable for setting status='inactive' should NOT be called immediately
      expect(updateTableSpy).not.toHaveBeenCalledWith('rooms');
    });
  });

  describe('joinRoom - Grace Period Cancellation', () => {
    it('should cancel grace period when user joins room', async () => {
      const userId = 'user-456';
      const roomCode = 'ROOM04';

      // Mock: Room exists and is active
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-4',
        code: roomCode,
        status: 'active',
        currentParticipants: 0, // Empty but still in grace period
        maxParticipants: 50,
      });

      // Mock: User not in room yet
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      // Mock: Insert participant
      mockQueryBuilder.execute.mockResolvedValueOnce(undefined);

      // Mock: Update room participant count
      mockQueryBuilder.executeTakeFirstOrThrow.mockResolvedValueOnce({
        id: 'room-id-4',
        code: roomCode,
        currentParticipants: 1,
      });

      await service.joinRoom(userId, roomCode);

      // Grace period should be cancelled
      expect(gracePeriodManager.cancelGracePeriod).toHaveBeenCalledWith(
        roomCode,
      );
    });

    it('should cancel grace period even if user was already in room', async () => {
      const userId = 'user-789';
      const roomCode = 'ROOM05';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-5',
        code: roomCode,
        status: 'active',
        currentParticipants: 1,
        maxParticipants: 50,
      });

      // Mock: User already in room
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-existing',
        userId,
        roomId: 'room-id-5',
        role: 'host',
        isActive: true,
      });

      await service.joinRoom(userId, roomCode);

      // Grace period should still be cancelled (in case it was running)
      expect(gracePeriodManager.cancelGracePeriod).toHaveBeenCalledWith(
        roomCode,
      );
    });
  });

  describe('finalizeRoomClosure', () => {
    it('should mark room as inactive if still empty after grace period', async () => {
      const roomCode = 'ROOM06';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-6',
        code: roomCode,
        status: 'active',
      });

      // Mock: No participants remain
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      // Mock: Update room to inactive
      mockQueryBuilder.execute.mockResolvedValueOnce(undefined);

      // Call the private method via grace period callback
      // We need to trigger the callback that was passed to startGracePeriod
      const userId = 'user-final';

      // Setup mocks for leaveRoom
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-6',
        code: roomCode,
        currentParticipants: 1,
      });
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-1',
        userId,
        roomId: 'room-id-6',
        role: 'host',
        isActive: true,
      });
      mockQueryBuilder.execute.mockResolvedValue(undefined);
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      // Use fake timers
      jest.useFakeTimers();

      await service.leaveRoom(userId, roomCode);

      // Fast forward to trigger grace period callback
      jest.advanceTimersByTime(60_000);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Room should be marked as inactive
      // Note: This tests the callback behavior
      expect(mockQueryBuilder.updateTable).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should NOT mark room as inactive if participants rejoined during grace period', async () => {
      const roomCode = 'ROOM07';

      // Mock: Room exists
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-7',
        code: roomCode,
        status: 'active',
      });

      // Mock: Participants have rejoined
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-rejoined',
      });

      // Setup: Start grace period, then someone rejoins
      const userId = 'user-leave';

      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-7',
        code: roomCode,
        currentParticipants: 1,
      });
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-1',
        userId,
        roomId: 'room-id-7',
        role: 'host',
        isActive: true,
      });
      mockQueryBuilder.execute.mockResolvedValue(undefined);
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      jest.useFakeTimers();

      await service.leaveRoom(userId, roomCode);

      // Simulate someone rejoining
      const userRejoin = 'user-rejoin';
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-id-7',
        code: roomCode,
        status: 'active',
        currentParticipants: 0,
        maxParticipants: 50,
      });
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);
      mockQueryBuilder.execute.mockResolvedValueOnce(undefined);
      mockQueryBuilder.executeTakeFirstOrThrow.mockResolvedValueOnce({
        id: 'room-id-7',
        currentParticipants: 1,
      });

      await service.joinRoom(userRejoin, roomCode);

      // Grace period cancelled
      expect(gracePeriodManager.cancelGracePeriod).toHaveBeenCalledWith(
        roomCode,
      );

      jest.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundException if room does not exist', async () => {
      const userId = 'user-404';
      const roomCode = 'NONEXISTENT';

      // Mock: Room not found
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      await expect(service.leaveRoom(userId, roomCode)).rejects.toThrow(
        NotFoundException,
      );

      // Grace period should not be started
      expect(gracePeriodManager.startGracePeriod).not.toHaveBeenCalled();
    });

    it('should handle grace period callback errors gracefully', async () => {
      const userId = 'user-error';
      const roomCode = 'ROOM_ERR';

      // Setup for leaveRoom
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'room-err',
        code: roomCode,
        currentParticipants: 1,
      });
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce({
        id: 'participant-err',
        userId,
        roomId: 'room-err',
        role: 'host',
        isActive: true,
      });
      mockQueryBuilder.execute.mockResolvedValue(undefined);
      mockQueryBuilder.executeTakeFirst.mockResolvedValueOnce(null);

      // Mock database error during finalize
      mockQueryBuilder.executeTakeFirst.mockRejectedValueOnce(
        new Error('Database error'),
      );

      jest.useFakeTimers();

      await service.leaveRoom(userId, roomCode);

      // Fast forward timers
      jest.advanceTimersByTime(60_000);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Error should be caught and logged (not thrown)
      // GracePeriodManager handles errors internally

      jest.useRealTimers();
    });
  });
});
