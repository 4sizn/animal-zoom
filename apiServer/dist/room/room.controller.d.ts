import { RoomService } from './room.service.js';
import { CreateRoomDto } from './dto/index.js';
import { User } from '../database/schema/index.js';
export declare class RoomController {
    private roomService;
    constructor(roomService: RoomService);
    createRoom(user: Omit<User, 'password'>, dto: CreateRoomDto): Promise<import("./dto/room-response.dto.js").RoomResponseDto>;
    getRoomByCode(roomCode: string): Promise<import("./dto/room-response.dto.js").RoomWithParticipantsDto>;
    joinRoom(user: Omit<User, 'password'>, roomCode: string): Promise<import("./dto/room-response.dto.js").RoomResponseDto>;
    leaveRoom(user: Omit<User, 'password'>, roomCode: string): Promise<{
        message: string;
    }>;
    deleteRoom(user: Omit<User, 'password'>, roomCode: string): Promise<{
        message: string;
    }>;
    getRoomParticipants(roomCode: string): Promise<{
        id: string;
        userId: string;
        displayName: string;
        role: import("../database/schema/room-participants.js").ParticipantRole;
        isActive: boolean;
        joinedAt: Date | null;
    }[]>;
}
