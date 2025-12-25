import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateRoomDto, RoomResponseDto, RoomWithParticipantsDto } from './dto/index.js';
import { generateRoomCode } from './room-code.util.js';

@Injectable()
export class RoomService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new room
   */
  async createRoom(
    userId: string,
    dto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    // Generate unique room code
    let roomCode: string;
    let codeExists = true;

    while (codeExists) {
      roomCode = generateRoomCode();
      const existing = await this.db.db
        .selectFrom('rooms')
        .select('id')
        .where('code', '=', roomCode)
        .executeTakeFirst();
      codeExists = !!existing;
    }

    // Create room
    const room = await this.db.db
      .insertInto('rooms')
      .values({
        code: roomCode!,
        name: dto.name || null,
        status: 'active',
        currentParticipants: 1,
        maxParticipants: dto.maxParticipants || 50,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Add creator as host
    await this.db.db
      .insertInto('room_participants')
      .values({
        userId,
        roomId: room.id,
        role: 'host',
        isActive: true,
        joinedAt: new Date(),
      })
      .execute();

    return {
      room,
      isHost: true,
    };
  }

  /**
   * Get room by code
   */
  async getRoomByCode(roomCode: string): Promise<RoomWithParticipantsDto> {
    const room = await this.db.db
      .selectFrom('rooms')
      .selectAll()
      .where('code', '=', roomCode)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Get participants
    const participants = await this.db.db
      .selectFrom('room_participants')
      .innerJoin('users', 'users.id', 'room_participants.userId')
      .select([
        'room_participants.id',
        'room_participants.userId',
        'users.displayName',
        'room_participants.role',
        'room_participants.isActive',
        'room_participants.joinedAt',
      ])
      .where('room_participants.roomId', '=', room.id)
      .where('room_participants.isActive', '=', true)
      .execute();

    return {
      room,
      isHost: false,
      participants: participants.map((p) => ({
        id: p.id,
        userId: p.userId,
        displayName: p.displayName || 'Unknown',
        role: p.role,
        isActive: p.isActive,
        joinedAt: p.joinedAt,
      })),
    };
  }

  /**
   * Join a room
   */
  async joinRoom(userId: string, roomCode: string): Promise<RoomResponseDto> {
    const room = await this.db.db
      .selectFrom('rooms')
      .selectAll()
      .where('code', '=', roomCode)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if room is full
    if (room.currentParticipants >= room.maxParticipants) {
      throw new BadRequestException('Room is full');
    }

    // Check if user is already in room
    const existingParticipant = await this.db.db
      .selectFrom('room_participants')
      .selectAll()
      .where('userId', '=', userId)
      .where('roomId', '=', room.id)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (existingParticipant) {
      return {
        room,
        isHost: existingParticipant.role === 'host',
      };
    }

    // Add participant
    await this.db.db
      .insertInto('room_participants')
      .values({
        userId,
        roomId: room.id,
        role: 'participant',
        isActive: true,
        joinedAt: new Date(),
      })
      .execute();

    // Update room participant count
    const updatedRoom = await this.db.db
      .updateTable('rooms')
      .set({
        currentParticipants: room.currentParticipants + 1,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where('id', '=', room.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      room: updatedRoom,
      isHost: false,
    };
  }

  /**
   * Leave a room
   */
  async leaveRoom(userId: string, roomCode: string): Promise<void> {
    const room = await this.db.db
      .selectFrom('rooms')
      .selectAll()
      .where('code', '=', roomCode)
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const participant = await this.db.db
      .selectFrom('room_participants')
      .selectAll()
      .where('userId', '=', userId)
      .where('roomId', '=', room.id)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!participant) {
      throw new NotFoundException('You are not in this room');
    }

    // Mark participant as inactive
    await this.db.db
      .updateTable('room_participants')
      .set({
        isActive: false,
        leftAt: new Date(),
      })
      .where('id', '=', participant.id)
      .execute();

    // Decrease participant count
    await this.db.db
      .updateTable('rooms')
      .set({
        currentParticipants: Math.max(0, room.currentParticipants - 1),
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where('id', '=', room.id)
      .execute();

    // If host left and room is empty, mark room as inactive
    if (participant.role === 'host') {
      const remainingParticipants = await this.db.db
        .selectFrom('room_participants')
        .select('id')
        .where('roomId', '=', room.id)
        .where('isActive', '=', true)
        .executeTakeFirst();

      if (!remainingParticipants) {
        await this.db.db
          .updateTable('rooms')
          .set({ status: 'inactive', updatedAt: new Date() })
          .where('id', '=', room.id)
          .execute();
      }
    }
  }

  /**
   * Delete a room (host only)
   */
  async deleteRoom(userId: string, roomCode: string): Promise<void> {
    const room = await this.db.db
      .selectFrom('rooms')
      .selectAll()
      .where('code', '=', roomCode)
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is host
    const participant = await this.db.db
      .selectFrom('room_participants')
      .selectAll()
      .where('userId', '=', userId)
      .where('roomId', '=', room.id)
      .executeTakeFirst();

    if (!participant || participant.role !== 'host') {
      throw new ForbiddenException('Only the host can delete the room');
    }

    // Mark all participants as inactive
    await this.db.db
      .updateTable('room_participants')
      .set({
        isActive: false,
        leftAt: new Date(),
      })
      .where('roomId', '=', room.id)
      .execute();

    // Mark room as inactive
    await this.db.db
      .updateTable('rooms')
      .set({
        status: 'inactive',
        currentParticipants: 0,
        updatedAt: new Date(),
      })
      .where('id', '=', room.id)
      .execute();
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(roomCode: string) {
    const room = await this.db.db
      .selectFrom('rooms')
      .select('id')
      .where('code', '=', roomCode)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const participants = await this.db.db
      .selectFrom('room_participants')
      .innerJoin('users', 'users.id', 'room_participants.userId')
      .select([
        'room_participants.id',
        'room_participants.userId',
        'users.displayName',
        'room_participants.role',
        'room_participants.isActive',
        'room_participants.joinedAt',
      ])
      .where('room_participants.roomId', '=', room.id)
      .where('room_participants.isActive', '=', true)
      .execute();

    return participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      displayName: p.displayName || 'Unknown',
      role: p.role,
      isActive: p.isActive,
      joinedAt: p.joinedAt,
    }));
  }
}
