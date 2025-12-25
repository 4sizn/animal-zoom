import { DatabaseService } from '../database/database.service';
import { CreateRoomDto, RoomResponseDto, RoomWithParticipantsDto } from './dto';
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
        role: import("../database/schema").ParticipantRole;
        isActive: boolean;
        joinedAt: Date | null;
    }[]>;
}
