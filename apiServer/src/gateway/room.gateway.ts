import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomService } from '../room/room.service.js';
import {
  JoinRoomEventDto,
  LeaveRoomEventDto,
  ChatMessageDto,
  SyncStateDto,
} from './dto/room-events.dto.js';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RoomGateway.name);
  private userRooms = new Map<string, string>(); // socketId -> roomCode

  constructor(private roomService: RoomService) {}

  handleConnection(client: Socket) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const userId = client.data.user?.sub;
      if (!userId) {
        this.logger.warn('Client connected without user data');
        client.disconnect();
        return;
      }

      this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);
      client.emit('connected', { message: 'Connected to server' });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const roomCode = this.userRooms.get(client.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = client.data.user?.sub;

    if (roomCode && userId) {
      try {
        await this.roomService.leaveRoom(userId as string, roomCode);
        void client.leave(roomCode);
        this.userRooms.delete(client.id);

        // Notify others in room

        this.server.to(roomCode).emit('user:left', {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          userId,
          roomCode,
        });

        this.logger.log(
          `Client disconnected: ${client.id}, left room: ${roomCode}`,
        );
      } catch (error) {
        this.logger.error('Disconnect error:', error);
      }
    }
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const userId = client.data.user.sub as string;
      const { roomCode } = data;

      // Join room via service
      const result = await this.roomService.joinRoom(userId, roomCode);

      // Join Socket.IO room
      await client.join(roomCode);
      this.userRooms.set(client.id, roomCode);

      // Get current participants
      const participants = await this.roomService.getRoomParticipants(roomCode);

      // Notify client
      client.emit('room:joined', {
        room: result.room,
        isHost: result.isHost,
        participants,
      });

      // Notify others in room
      client.to(roomCode).emit('user:joined', {
        userId,
        roomCode,
        participants,
      });

      this.logger.log(`User ${userId} joined room ${roomCode}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Join room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorMessage = error.message || 'Unknown error';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      client.emit('error', { message: errorMessage });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @MessageBody() data: LeaveRoomEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const userId = client.data.user.sub as string;
      const { roomCode } = data;

      // Leave room via service
      await this.roomService.leaveRoom(userId, roomCode);

      // Leave Socket.IO room
      await client.leave(roomCode);
      this.userRooms.delete(client.id);

      // Notify others in room
      this.server.to(roomCode).emit('user:left', {
        userId,
        roomCode,
      });

      client.emit('room:left', { roomCode });

      this.logger.log(`User ${userId} left room ${roomCode}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Leave room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorMessage = error.message || 'Unknown error';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      client.emit('error', { message: errorMessage });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(
    @MessageBody() data: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const userId = client.data.user.sub;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const username = client.data.user.username;
      const { roomCode, message } = data;

      // Broadcast to all in room (including sender)

      this.server.to(roomCode).emit('chat:message', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        username,
        message,
        timestamp: new Date(),
      });

      this.logger.log(
        `Chat message in room ${roomCode} from ${username as string}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Chat message error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorMessage = error.message || 'Unknown error';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('state:sync')
  handleStateSync(
    @MessageBody() data: SyncStateDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const userId = client.data.user.sub;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { roomCode, position, rotation, avatarState } = data;

      // Broadcast to others in room (exclude sender)

      client.to(roomCode).emit('state:update', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userId,

        position,

        rotation,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        avatarState,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error('State sync error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorMessage = error.message || 'Unknown error';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('room:getParticipants')
  async handleGetParticipants(@MessageBody() data: { roomCode: string }) {
    try {
      const participants = await this.roomService.getRoomParticipants(
        data.roomCode,
      );

      return { success: true, participants };
    } catch (error) {
      this.logger.error('Get participants error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorMessage = error.message || 'Unknown error';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { success: false, error: errorMessage };
    }
  }

  // Broadcast methods for external use

  broadcastAvatarUpdate(userId: string, avatarConfig: any): void {
    // Find all rooms this user is in and broadcast
    const userRooms: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.userRooms.forEach((roomCode, _socketId) => {
      if (!userRooms.includes(roomCode)) {
        userRooms.push(roomCode);
      }
    });

    userRooms.forEach((roomCode) => {
      this.server.to(roomCode).emit('avatar:updated', {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        avatarConfig,
        timestamp: new Date(),
      });
    });

    this.logger.log(
      `Avatar updated for user ${userId}, broadcast to ${userRooms.length} rooms`,
    );
  }

  broadcastRoomConfigUpdate(roomCode: string, roomConfig: any): void {
    this.server.to(roomCode).emit('room:updated', {
      roomCode,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      roomConfig,
      timestamp: new Date(),
    });

    this.logger.log(`Room config updated for room ${roomCode}`);
  }
}
