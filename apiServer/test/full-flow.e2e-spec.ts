import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { io as ioClient, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';

/**
 * E2E Test: Complete Room Flow
 *
 * This test suite covers the full user journey:
 * 1. User registers
 * 2. Creates room
 * 3. Guest joins room
 * 4. Both update avatars
 * 5. Exchange chat messages (via WebSocket)
 * 6. Both leave room
 * 7. Verify room auto-deletion
 */
describe('Full Room Flow (e2e)', () => {
  let app: INestApplication<App>;
  let httpServer: any;
  let baseUrl: string;

  // User data
  let registeredUserToken: string;
  let registeredUserId: string;
  let guestUserToken: string;
  let guestUserId: string;

  // Room data
  let roomCode: string;
  let roomId: string;

  // WebSocket clients
  let userSocket: Socket;
  let guestSocket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    const address = httpServer.address();
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    // Clean up WebSocket connections
    if (userSocket?.connected) userSocket.disconnect();
    if (guestSocket?.connected) guestSocket.disconnect();

    await app.close();
    httpServer.close();
  });

  describe('Step 1: User Registration', () => {
    it('should register a new user with email and password', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!',
          displayName: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.displayName).toBe('Test User');
      expect(response.body.user.email).toBe('testuser@example.com');
      expect(response.body.user.isGuest).toBe(false);

      registeredUserToken = response.body.accessToken;
      registeredUserId = response.body.user.id;
    });

    it('should allow registered user to fetch their profile', async () => {
      const response = await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      expect(response.body.id).toBe(registeredUserId);
      expect(response.body.displayName).toBe('Test User');
      expect(response.body.isGuest).toBe(false);
    });
  });

  describe('Step 2: Room Creation', () => {
    it('should create a new room by the registered user', async () => {
      const response = await request(httpServer)
        .post('/rooms')
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({
          maxParticipants: 10,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('roomCode');
      expect(response.body.roomCode).toHaveLength(6);
      expect(response.body.hostUserId).toBe(registeredUserId);
      expect(response.body.isActive).toBe(true);
      expect(response.body.maxParticipants).toBe(10);

      roomCode = response.body.roomCode;
      roomId = response.body.id;
    });

    it('should allow querying the created room by code', async () => {
      const response = await request(httpServer)
        .get(`/rooms/${roomCode}`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      expect(response.body.id).toBe(roomId);
      expect(response.body.roomCode).toBe(roomCode);
      expect(response.body.isActive).toBe(true);
    });
  });

  describe('Step 3: Guest User Creation and Room Join', () => {
    it('should create a guest user', async () => {
      const response = await request(httpServer)
        .post('/auth/guest')
        .send({
          displayName: 'Guest User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.isGuest).toBe(true);
      expect(response.body.user.displayName).toBe('Guest User');

      guestUserToken = response.body.accessToken;
      guestUserId = response.body.user.id;
    });

    it('should allow registered user to join the room', async () => {
      const response = await request(httpServer)
        .post(`/rooms/${roomCode}/join`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({
          displayName: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(registeredUserId);
      expect(response.body.roomId).toBe(roomId);
      expect(response.body.displayName).toBe('Test User');
    });

    it('should allow guest user to join the room', async () => {
      const response = await request(httpServer)
        .post(`/rooms/${roomCode}/join`)
        .set('Authorization', `Bearer ${guestUserToken}`)
        .send({
          displayName: 'Guest User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(guestUserId);
      expect(response.body.roomId).toBe(roomId);
      expect(response.body.displayName).toBe('Guest User');
    });

    it('should list both participants in the room', async () => {
      const response = await request(httpServer)
        .get(`/rooms/${roomCode}/participants`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);

      const userParticipant = response.body.find(
        (p: any) => p.userId === registeredUserId,
      );
      const guestParticipant = response.body.find(
        (p: any) => p.userId === guestUserId,
      );

      expect(userParticipant).toBeDefined();
      expect(userParticipant.displayName).toBe('Test User');
      expect(guestParticipant).toBeDefined();
      expect(guestParticipant.displayName).toBe('Guest User');
    });
  });

  describe('Step 4: Avatar Customization', () => {
    it('should allow registered user to update their avatar', async () => {
      const response = await request(httpServer)
        .put('/avatars/me')
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({
          modelUrl: 'https://example.com/model1.glb',
          primaryColor: '#FF0000',
          secondaryColor: '#00FF00',
          accessories: ['hat', 'glasses'],
        })
        .expect(200);

      expect(response.body.userId).toBe(registeredUserId);
      expect(response.body.modelUrl).toBe('https://example.com/model1.glb');
      expect(response.body.primaryColor).toBe('#FF0000');
      expect(response.body.secondaryColor).toBe('#00FF00');
      expect(response.body.accessories).toEqual(['hat', 'glasses']);
    });

    it('should allow guest user to update their avatar', async () => {
      const response = await request(httpServer)
        .put('/avatars/me')
        .set('Authorization', `Bearer ${guestUserToken}`)
        .send({
          modelUrl: 'https://example.com/model2.glb',
          primaryColor: '#0000FF',
          secondaryColor: '#FFFF00',
          accessories: ['backpack'],
        })
        .expect(200);

      expect(response.body.userId).toBe(guestUserId);
      expect(response.body.modelUrl).toBe('https://example.com/model2.glb');
      expect(response.body.primaryColor).toBe('#0000FF');
      expect(response.body.secondaryColor).toBe('#FFFF00');
      expect(response.body.accessories).toEqual(['backpack']);
    });

    it('should allow fetching other user avatars', async () => {
      const response = await request(httpServer)
        .get(`/avatars/${registeredUserId}`)
        .set('Authorization', `Bearer ${guestUserToken}`)
        .expect(200);

      expect(response.body.userId).toBe(registeredUserId);
      expect(response.body.primaryColor).toBe('#FF0000');
    });
  });

  describe('Step 5: Room Configuration', () => {
    it('should allow host to update room configuration', async () => {
      const response = await request(httpServer)
        .put(`/room-configs/${roomCode}`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({
          lightingPreset: 'bright',
          floorColor: '#CCCCCC',
          wallColor: '#FFFFFF',
          furniture: ['table', 'chair'],
          decorations: ['plant', 'picture'],
        })
        .expect(200);

      expect(response.body.roomId).toBe(roomId);
      expect(response.body.lightingPreset).toBe('bright');
      expect(response.body.floorColor).toBe('#CCCCCC');
      expect(response.body.wallColor).toBe('#FFFFFF');
      expect(response.body.furniture).toEqual(['table', 'chair']);
      expect(response.body.decorations).toEqual(['plant', 'picture']);
    });

    it('should prevent non-host from updating room configuration', async () => {
      await request(httpServer)
        .put(`/room-configs/${roomCode}`)
        .set('Authorization', `Bearer ${guestUserToken}`)
        .send({
          lightingPreset: 'dark',
        })
        .expect(403);
    });

    it('should allow fetching room configuration', async () => {
      const response = await request(httpServer)
        .get(`/room-configs/${roomCode}`)
        .set('Authorization', `Bearer ${guestUserToken}`)
        .expect(200);

      expect(response.body.roomId).toBe(roomId);
      expect(response.body.lightingPreset).toBe('bright');
    });
  });

  describe('Step 6: WebSocket Real-time Communication', () => {
    it('should establish WebSocket connection for both users', (done) => {
      let userConnected = false;
      let guestConnected = false;

      // Connect registered user
      userSocket = ioClient(baseUrl, {
        auth: { token: registeredUserToken },
        transports: ['websocket'],
      });

      userSocket.on('connect', () => {
        userConnected = true;
        if (userConnected && guestConnected) done();
      });

      // Connect guest user
      guestSocket = ioClient(baseUrl, {
        auth: { token: guestUserToken },
        transports: ['websocket'],
      });

      guestSocket.on('connect', () => {
        guestConnected = true;
        if (userConnected && guestConnected) done();
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!userConnected || !guestConnected) {
          done(new Error('WebSocket connection timeout'));
        }
      }, 5000);
    });

    it('should allow both users to join room via WebSocket', (done) => {
      let userJoined = false;
      let guestJoined = false;

      // User joins room
      userSocket.emit('room:join', { roomCode });
      userSocket.on('room:joined', (data) => {
        expect(data).toHaveProperty('roomCode', roomCode);
        userJoined = true;
        if (userJoined && guestJoined) done();
      });

      // Guest joins room
      guestSocket.emit('room:join', { roomCode });
      guestSocket.on('room:joined', (data) => {
        expect(data).toHaveProperty('roomCode', roomCode);
        guestJoined = true;
        if (userJoined && guestJoined) done();
      });

      setTimeout(() => {
        if (!userJoined || !guestJoined) {
          done(new Error('Room join timeout'));
        }
      }, 5000);
    });

    it('should broadcast chat messages between users', (done) => {
      const testMessage = 'Hello from registered user!';

      // Guest listens for message
      guestSocket.once('chat:message', (data) => {
        expect(data.message).toBe(testMessage);
        expect(data).toHaveProperty('senderId');
        expect(data).toHaveProperty('senderName');
        done();
      });

      // User sends message
      userSocket.emit('chat:message', {
        roomCode,
        message: testMessage,
      });

      setTimeout(() => {
        done(new Error('Chat message not received'));
      }, 5000);
    });

    it('should broadcast state sync updates', (done) => {
      const stateUpdate = {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      };

      // Guest listens for state update
      guestSocket.once('state:sync', (data) => {
        expect(data.position).toEqual(stateUpdate.position);
        expect(data.rotation).toEqual(stateUpdate.rotation);
        done();
      });

      // User sends state update
      userSocket.emit('state:sync', {
        roomCode,
        ...stateUpdate,
      });

      setTimeout(() => {
        done(new Error('State sync not received'));
      }, 5000);
    });

    it('should get current participants via WebSocket', (done) => {
      userSocket.emit('room:getParticipants', { roomCode });

      userSocket.once('room:participants', (data) => {
        expect(data).toHaveProperty('participants');
        expect(Array.isArray(data.participants)).toBe(true);
        expect(data.participants.length).toBeGreaterThanOrEqual(2);
        done();
      });

      setTimeout(() => {
        done(new Error('Get participants timeout'));
      }, 5000);
    });
  });

  describe('Step 7: Leave Room and Auto-deletion', () => {
    it('should allow guest user to leave the room', async () => {
      await request(httpServer)
        .post(`/rooms/${roomCode}/leave`)
        .set('Authorization', `Bearer ${guestUserToken}`)
        .expect(200);

      // Verify participant removed
      const response = await request(httpServer)
        .get(`/rooms/${roomCode}/participants`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(registeredUserId);
    });

    it('should allow registered user to leave the room', async () => {
      await request(httpServer)
        .post(`/rooms/${roomCode}/leave`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      // Verify no participants left
      const response = await request(httpServer)
        .get(`/rooms/${roomCode}/participants`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should auto-deactivate room when empty', async () => {
      const response = await request(httpServer)
        .get(`/rooms/${roomCode}`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(200);

      // Room should be deactivated when all participants leave
      expect(response.body.isActive).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should reject registration with existing email', async () => {
      await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'AnotherPassword123!',
          displayName: 'Duplicate User',
        })
        .expect(409); // Conflict
    });

    it('should reject invalid login credentials', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword',
        })
        .expect(401); // Unauthorized
    });

    it('should reject joining non-existent room', async () => {
      await request(httpServer)
        .post('/rooms/XXXXXX/join')
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({
          displayName: 'Test User',
        })
        .expect(404); // Not Found
    });

    it('should reject unauthenticated requests', async () => {
      await request(httpServer).get('/auth/me').expect(401); // Unauthorized
    });

    it('should reject invalid room code format', async () => {
      await request(httpServer)
        .get('/rooms/ABC')
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .expect(400); // Bad Request
    });
  });
});
