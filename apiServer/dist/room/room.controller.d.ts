import { RoomService } from './room.service';
import { CreateRoomDto } from './dto';
import { User } from '../database/schema';
export declare class RoomController {
    private roomService;
    constructor(roomService: RoomService);
    createRoom(user: Omit<User, 'password'>, dto: CreateRoomDto): Promise<import("./dto").RoomResponseDto>;
    getRoomByCode(roomCode: string): Promise<import("./dto").RoomWithParticipantsDto>;
    joinRoom(user: Omit<User, 'password'>, roomCode: string): Promise<import("./dto").RoomResponseDto>;
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
        role: import("../database/schema").ParticipantRole;
        isActive: boolean;
        joinedAt: Date | null;
    }[]>;
}
