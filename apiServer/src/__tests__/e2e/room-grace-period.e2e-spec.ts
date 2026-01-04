import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module.js';
import { io, Socket } from 'socket.io-client';
import { DatabaseService } from '../../database/database.service.js';
import { GracePeriodManager } from '../../room/grace-period-manager.js';
import { RoomService } from '../../room/room.service.js';

describe('Room Grace Period E2E', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let gracePeriodManager: GracePeriodManager;
  let serverUrl: string;

  // Test data
  let testUserId: string;
  let testRoomCode: string;
  let testRoomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0); // Random port

    const address = app.getHttpServer().address();
    const port = address.port;
    serverUrl = `http://localhost:${port}`;

    databaseService = app.get<DatabaseService>(DatabaseService);
    gracePeriodManager = app.get<GracePeriodManager>(GracePeriodManager);

    // Set shorter grace period for testing (5 seconds instead of 60)
    gracePeriodManager.setGracePeriodMs(5000);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Create test user
    const user = await databaseService.db
      .insertInto('users')
      .values({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        displayName: 'Test User',
        passwordHash: 'test-hash',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    testUserId = user.id;

    // Create test room
    const room = await databaseService.db
      .insertInto('rooms')
      .values({
        code: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'active',
        currentParticipants: 1,
        maxParticipants: 50,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    testRoomCode = room.code;
    testRoomId = room.id;

    // Add user as host
    await databaseService.db
      .insertInto('room_participants')
      .values({
        userId: testUserId,
        roomId: testRoomId,
        role: 'host',
        isActive: true,
        joinedAt: new Date(),
      })
      .execute();
  });

  afterEach(async () => {
    // Cleanup: Delete test data
    if (testRoomId) {
      await databaseService.db
        .deleteFrom('room_participants')
        .where('roomId', '=', testRoomId)
        .execute();

      await databaseService.db
        .deleteFrom('rooms')
        .where('id', '=', testRoomId)
        .execute();
    }

    if (testUserId) {
      await databaseService.db
        .deleteFrom('users')
        .where('id', '=', testUserId)
        .execute();
    }
  });

  describe('Grace Period Integration', () => {
    it('should keep room active during grace period after last user disconnects', async () => {
      // Create WebSocket client
      const client: Socket = io(serverUrl, {
        auth: {
          token: 'mock-token', // In real scenario, this would be a valid JWT
        },
        transports: ['websocket'],
      });

      // Mock user data on socket
      (client as any).data = { user: { sub: testUserId } };

      await new Promise<void>((resolve) => {
        client.on('connected', () => resolve());
        setTimeout(() => resolve(), 1000); // Timeout fallback
      });

      // User leaves room (disconnect)
      client.disconnect();

      // Wait 2 seconds (within grace period of 5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check room is still active
      const room = await databaseService.db
        .selectFrom('rooms')
        .selectAll()
        .where('code', '=', testRoomCode)
        .executeTakeFirst();

      expect(room).toBeDefined();
      expect(room?.status).toBe('active');
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(true);
    });

    it('should mark room as inactive after grace period expires', async () => {
      // Simulate user leaving
      await databaseService.db
        .updateTable('room_participants')
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where('roomId', '=', testRoomId)
        .where('userId', '=', testUserId)
        .execute();

      await databaseService.db
        .updateTable('rooms')
        .set({
          currentParticipants: 0,
          updatedAt: new Date(),
        })
        .where('id', '=', testRoomId)
        .execute();

      // Manually trigger grace period (simulating leaveRoom)
      const roomService = app.get(RoomService);
      await roomService.leaveRoom(testUserId, testRoomCode);

      // Wait for grace period to expire (5 seconds + buffer)
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Check room is now inactive
      const room = await databaseService.db
        .selectFrom('rooms')
        .selectAll()
        .where('code', '=', testRoomCode)
        .executeTakeFirst();

      expect(room).toBeDefined();
      expect(room?.status).toBe('inactive');
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);
    }, 10000); // 10 second timeout

    it('should cancel grace period when user rejoins within timeout', async () => {
      // Simulate user leaving
      await databaseService.db
        .updateTable('room_participants')
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where('roomId', '=', testRoomId)
        .where('userId', '=', testUserId)
        .execute();

      await databaseService.db
        .updateTable('rooms')
        .set({
          currentParticipants: 0,
          updatedAt: new Date(),
        })
        .where('id', '=', testRoomId)
        .execute();

      // Start grace period
      const roomService = app.get(RoomService);
      await roomService.leaveRoom(testUserId, testRoomCode);

      // Verify grace period started
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(true);

      // Wait 2 seconds (within grace period)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // User rejoins
      await roomService.joinRoom(testUserId, testRoomCode);

      // Grace period should be cancelled
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);

      // Room should still be active
      const room = await databaseService.db
        .selectFrom('rooms')
        .selectAll()
        .where('code', '=', testRoomCode)
        .executeTakeFirst();

      expect(room?.status).toBe('active');
      expect(room?.currentParticipants).toBeGreaterThan(0);
    }, 10000);

    it('should handle multiple users disconnecting and reconnecting', async () => {
      // Create second user
      const user2 = await databaseService.db
        .insertInto('users')
        .values({
          username: `testuser2_${Date.now()}`,
          email: `test2_${Date.now()}@example.com`,
          displayName: 'Test User 2',
          passwordHash: 'test-hash-2',
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const user2Id = user2.id;

      const roomService = app.get(RoomService);

      // User 2 joins
      await roomService.joinRoom(user2Id, testRoomCode);

      // User 1 leaves
      await roomService.leaveRoom(testUserId, testRoomCode);

      // Grace period should NOT start (user 2 still in room)
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);

      // User 2 leaves
      await roomService.leaveRoom(user2Id, testRoomCode);

      // NOW grace period should start
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(true);

      // User 1 rejoins
      await roomService.joinRoom(testUserId, testRoomCode);

      // Grace period cancelled
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);

      // Cleanup user 2
      await databaseService.db
        .deleteFrom('room_participants')
        .where('userId', '=', user2Id)
        .execute();

      await databaseService.db
        .deleteFrom('users')
        .where('id', '=', user2Id)
        .execute();
    });

    it('should not start grace period if room manually deleted', async () => {
      // Delete room manually (simulate admin deletion)
      await databaseService.db
        .updateTable('rooms')
        .set({ status: 'inactive', updatedAt: new Date() })
        .where('id', '=', testRoomId)
        .execute();

      const roomService = app.get(RoomService);

      // Attempt to leave room (should throw NotFoundException)
      await expect(
        roomService.leaveRoom(testUserId, testRoomCode),
      ).rejects.toThrow();

      // Grace period should not be started
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid disconnect/reconnect cycles', async () => {
      const roomService = app.get(RoomService);

      // Rapid disconnect/reconnect 5 times
      for (let i = 0; i < 5; i++) {
        await roomService.leaveRoom(testUserId, testRoomCode);
        await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
        await roomService.joinRoom(testUserId, testRoomCode);
      }

      // Room should still be active
      const room = await databaseService.db
        .selectFrom('rooms')
        .selectAll()
        .where('code', '=', testRoomCode)
        .executeTakeFirst();

      expect(room?.status).toBe('active');
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);
    });

    it('should cleanup grace period if room is deleted during timeout', async () => {
      const roomService = app.get(RoomService);

      // Start grace period
      await roomService.leaveRoom(testUserId, testRoomCode);
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(true);

      // Delete room during grace period
      await databaseService.db
        .deleteFrom('room_participants')
        .where('roomId', '=', testRoomId)
        .execute();

      await databaseService.db
        .deleteFrom('rooms')
        .where('id', '=', testRoomId)
        .execute();

      // Wait for grace period to try to execute
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Grace period should be cleaned up (finalize should handle missing room gracefully)
      expect(gracePeriodManager.hasGracePeriod(testRoomCode)).toBe(false);

      // Prevent cleanup in afterEach
      testRoomId = null as any;
    }, 10000);
  });
});
