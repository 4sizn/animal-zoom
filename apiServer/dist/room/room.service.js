"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const room_code_util_1 = require("./room-code.util");
let RoomService = class RoomService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createRoom(userId, dto) {
        let roomCode;
        let codeExists = true;
        while (codeExists) {
            roomCode = (0, room_code_util_1.generateRoomCode)();
            const existing = await this.db.db
                .selectFrom('rooms')
                .select('id')
                .where('code', '=', roomCode)
                .executeTakeFirst();
            codeExists = !!existing;
        }
        const room = await this.db.db
            .insertInto('rooms')
            .values({
            code: roomCode,
            name: dto.name || null,
            status: 'active',
            currentParticipants: 1,
            maxParticipants: dto.maxParticipants || 50,
            lastActivityAt: new Date(),
            updatedAt: new Date(),
        })
            .returningAll()
            .executeTakeFirstOrThrow();
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
    async getRoomByCode(roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .selectAll()
            .where('code', '=', roomCode)
            .where('status', '=', 'active')
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
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
    async joinRoom(userId, roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .selectAll()
            .where('code', '=', roomCode)
            .where('status', '=', 'active')
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        if (room.currentParticipants >= room.maxParticipants) {
            throw new common_1.BadRequestException('Room is full');
        }
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
    async leaveRoom(userId, roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .selectAll()
            .where('code', '=', roomCode)
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const participant = await this.db.db
            .selectFrom('room_participants')
            .selectAll()
            .where('userId', '=', userId)
            .where('roomId', '=', room.id)
            .where('isActive', '=', true)
            .executeTakeFirst();
        if (!participant) {
            throw new common_1.NotFoundException('You are not in this room');
        }
        await this.db.db
            .updateTable('room_participants')
            .set({
            isActive: false,
            leftAt: new Date(),
        })
            .where('id', '=', participant.id)
            .execute();
        await this.db.db
            .updateTable('rooms')
            .set({
            currentParticipants: Math.max(0, room.currentParticipants - 1),
            lastActivityAt: new Date(),
            updatedAt: new Date(),
        })
            .where('id', '=', room.id)
            .execute();
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
    async deleteRoom(userId, roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .selectAll()
            .where('code', '=', roomCode)
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const participant = await this.db.db
            .selectFrom('room_participants')
            .selectAll()
            .where('userId', '=', userId)
            .where('roomId', '=', room.id)
            .executeTakeFirst();
        if (!participant || participant.role !== 'host') {
            throw new common_1.ForbiddenException('Only the host can delete the room');
        }
        await this.db.db
            .updateTable('room_participants')
            .set({
            isActive: false,
            leftAt: new Date(),
        })
            .where('roomId', '=', room.id)
            .execute();
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
    async getRoomParticipants(roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .select('id')
            .where('code', '=', roomCode)
            .where('status', '=', 'active')
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
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
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RoomService);
//# sourceMappingURL=room.service.js.map