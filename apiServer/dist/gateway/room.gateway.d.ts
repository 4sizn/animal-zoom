import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service';
import { JoinRoomEventDto, LeaveRoomEventDto, ChatMessageDto, SyncStateDto } from './dto/room-events.dto';
export declare class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private roomService;
    server: Server;
    private readonly logger;
    private userRooms;
    constructor(roomService: RoomService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(data: JoinRoomEventDto, client: Socket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleLeaveRoom(data: LeaveRoomEventDto, client: Socket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleChatMessage(data: ChatMessageDto, client: Socket): {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    };
    handleStateSync(data: SyncStateDto, client: Socket): {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    };
    handleGetParticipants(data: {
        roomCode: string;
    }): Promise<{
        success: boolean;
        participants: {
            id: string;
            userId: string;
            displayName: string;
            role: import("../database/schema").ParticipantRole;
            isActive: boolean;
            joinedAt: Date | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        participants?: undefined;
    }>;
    broadcastAvatarUpdate(userId: string, avatarConfig: any): void;
    broadcastRoomConfigUpdate(roomCode: string, roomConfig: any): void;
}
