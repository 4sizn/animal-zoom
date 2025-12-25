import { DatabaseService } from '../database/database.service.js';
import { CreateRoomDto, RoomResponseDto, RoomWithParticipantsDto } from './dto/index.js';
export declare class RoomService {
    private db;
    constructor(db: DatabaseService);
    createRoom(userId: string, dto: CreateRoomDto): Promise<RoomResponseDto>;
    getRoomByCode(roomCode: string): Promise<RoomWithParticipantsDto>;
    joinRoom(userId: string, roomCode: string): Promise<RoomResponseDto>;
    leaveRoom(userId: string, roomCode: string): Promise<void>;
    deleteRoom(userId: string, roomCode: string): Promise<void>;
    getRoomParticipants(roomCode: string): Promise<{
        id: string;
        userId: string;
        displayName: string;
        role: import("../database/schema/room-participants.js").ParticipantRole;
        isActive: boolean;
        joinedAt: Date | null;
    }[]>;
}
