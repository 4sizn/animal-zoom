/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/await-thenable */

import { Test, TestingModule } from '@nestjs/testing';
import { RoomGateway } from '../room.gateway.js';
import { RoomService } from '../../room/room.service.js';
import { Socket } from 'socket.io';

describe('RoomGateway', () => {
  let gateway: RoomGateway;
  let roomService: jest.Mocked<RoomService>;
  let mockClient: Partial<Socket>;
  let mockServer: any;

  beforeEach(async () => {
    const mockRoomService = {
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      getRoomParticipants: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomGateway,
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    gateway = module.get<RoomGateway>(RoomGateway);
    roomService = module.get(RoomService);

    // Mock Socket.IO server
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    gateway.server = mockServer;

    // Mock client socket
    mockClient = {
      id: 'test-socket-id',
      data: {
        user: {
          sub: 'user-123',
          username: 'testuser',
        },
      },
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      disconnect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should handle valid connection', async () => {
      await gateway.handleConnection(mockClient as Socket);

      expect(mockClient.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to server',
      });
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client without user data', async () => {
      mockClient.data = { user: undefined };

      await gateway.handleConnection(mockClient as Socket);

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockClient.emit).not.toHaveBeenCalled();
    });

    it('should disconnect client without userId', async () => {
      mockClient.data = { user: { sub: undefined } };

      await gateway.handleConnection(mockClient as Socket);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should cleanup when user leaves room on disconnect', async () => {
      const roomCode = 'ABC123';
      gateway['userRooms'].set(mockClient.id!, roomCode);

      roomService.leaveRoom.mockResolvedValue();

      await gateway.handleDisconnect(mockClient as Socket);

      expect(roomService.leaveRoom).toHaveBeenCalledWith('user-123', roomCode);
      expect(mockClient.leave).toHaveBeenCalledWith(roomCode);
      expect(gateway['userRooms'].has(mockClient.id!)).toBe(false);
      expect(mockServer.to).toHaveBeenCalledWith(roomCode);
      expect(mockServer.emit).toHaveBeenCalledWith('user:left', {
        userId: 'user-123',
        roomCode,
      });
    });

    it('should handle disconnect without room', async () => {
      await gateway.handleDisconnect(mockClient as Socket);

      expect(roomService.leaveRoom).not.toHaveBeenCalled();
      expect(mockClient.leave).not.toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      const roomCode = 'ABC123';
      gateway['userRooms'].set(mockClient.id!, roomCode);

      roomService.leaveRoom.mockRejectedValue(new Error('Database error'));

      await gateway.handleDisconnect(mockClient as Socket);

      // Should not throw error
      expect(roomService.leaveRoom).toHaveBeenCalled();
    });
  });

  describe('handleJoinRoom', () => {
    it('should successfully join room', async () => {
      const roomCode = 'ABC123';
      const mockRoom = {
        id: 'room-1',
        code: roomCode,
        status: 'active' as const,
        currentParticipants: 2,
        maxParticipants: 50,
      };
      const mockParticipants = [
        { userId: 'user-123', username: 'testuser', role: 'host' },
      ];

      roomService.joinRoom.mockResolvedValue({
        room: mockRoom,
        isHost: false,
      });
      roomService.getRoomParticipants.mockResolvedValue(mockParticipants);

      const result = await gateway.handleJoinRoom(
        { roomCode },
        mockClient as Socket,
      );

      expect(roomService.joinRoom).toHaveBeenCalledWith('user-123', roomCode);
      expect(mockClient.join).toHaveBeenCalledWith(roomCode);
      expect(gateway['userRooms'].get(mockClient.id!)).toBe(roomCode);
      expect(mockClient.emit).toHaveBeenCalledWith('room:joined', {
        room: mockRoom,
        isHost: false,
        participants: mockParticipants,
      });
      expect(mockClient.to).toHaveBeenCalledWith(roomCode);
      expect(result).toEqual({ success: true });
    });

    it('should handle join room errors', async () => {
      const roomCode = 'ABC123';
      const error = new Error('Room is full');

      roomService.joinRoom.mockRejectedValue(error);

      const result = await gateway.handleJoinRoom(
        { roomCode },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: error.message,
      });
      expect(result).toEqual({ success: false, error: error.message });
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleLeaveRoom', () => {
    it('should successfully leave room', async () => {
      const roomCode = 'ABC123';

      roomService.leaveRoom.mockResolvedValue();

      const result = await gateway.handleLeaveRoom(
        { roomCode },
        mockClient as Socket,
      );

      expect(roomService.leaveRoom).toHaveBeenCalledWith('user-123', roomCode);
      expect(mockClient.leave).toHaveBeenCalledWith(roomCode);
      expect(gateway['userRooms'].has(mockClient.id!)).toBe(false);
      expect(mockServer.to).toHaveBeenCalledWith(roomCode);
      expect(mockServer.emit).toHaveBeenCalledWith('user:left', {
        userId: 'user-123',
        roomCode,
      });
      expect(mockClient.emit).toHaveBeenCalledWith('room:left', { roomCode });
      expect(result).toEqual({ success: true });
    });

    it('should handle leave room errors', async () => {
      const roomCode = 'ABC123';
      const error = new Error('Room not found');

      roomService.leaveRoom.mockRejectedValue(error);

      const result = await gateway.handleLeaveRoom(
        { roomCode },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: error.message,
      });
      expect(result).toEqual({ success: false, error: error.message });
    });
  });

  describe('handleChatMessage', () => {
    it('should broadcast chat message to room', async () => {
      const roomCode = 'ABC123';
      const message = 'Hello world';

      const result = await gateway.handleChatMessage(
        { roomCode, message },
        mockClient as Socket,
      );

      expect(mockServer.to).toHaveBeenCalledWith(roomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat:message',
        expect.objectContaining({
          userId: 'user-123',
          username: 'testuser',
          message,
          timestamp: expect.any(Date),
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle chat message errors', async () => {
      mockClient.data = undefined;

      const result = await gateway.handleChatMessage(
        { roomCode: 'ABC123', message: 'test' },
        mockClient as Socket,
      );

      expect(result).toEqual({
        success: false,
        error: expect.any(String),
      });
    });
  });

  describe('handleStateSync', () => {
    it('should broadcast state to other clients', async () => {
      const roomCode = 'ABC123';
      const position = { x: 1, y: 2, z: 3 };
      const rotation = { x: 0, y: 0, z: 0 };
      const avatarState = { animation: 'walk' };

      const result = await gateway.handleStateSync(
        { roomCode, position, rotation, avatarState },
        mockClient as Socket,
      );

      expect(mockClient.to).toHaveBeenCalledWith(roomCode);
      expect(result).toEqual({ success: true });
    });

    it('should handle optional position/rotation', async () => {
      const roomCode = 'ABC123';

      const result = await gateway.handleStateSync(
        { roomCode },
        mockClient as Socket,
      );

      expect(mockClient.to).toHaveBeenCalledWith(roomCode);
      expect(result).toEqual({ success: true });
    });

    it('should handle state sync errors', async () => {
      mockClient.data = undefined;

      const result = await gateway.handleStateSync(
        { roomCode: 'ABC123' },
        mockClient as Socket,
      );

      expect(result).toEqual({
        success: false,
        error: expect.any(String),
      });
    });
  });

  describe('handleGetParticipants', () => {
    it('should return room participants', async () => {
      const roomCode = 'ABC123';
      const mockParticipants = [
        { userId: 'user-1', username: 'user1', role: 'host' },
        { userId: 'user-2', username: 'user2', role: 'participant' },
      ];

      roomService.getRoomParticipants.mockResolvedValue(mockParticipants);

      const result = await gateway.handleGetParticipants(
        { roomCode },
        mockClient as Socket,
      );

      expect(roomService.getRoomParticipants).toHaveBeenCalledWith(roomCode);
      expect(result).toEqual({
        success: true,
        participants: mockParticipants,
      });
    });

    it('should handle get participants errors', async () => {
      const roomCode = 'ABC123';
      const error = new Error('Room not found');

      roomService.getRoomParticipants.mockRejectedValue(error);

      const result = await gateway.handleGetParticipants(
        { roomCode },
        mockClient as Socket,
      );

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });
  });
});
