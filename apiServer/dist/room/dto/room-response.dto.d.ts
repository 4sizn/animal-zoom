import { Room } from '../../database/schema/index.js';
export declare class RoomResponseDto {
    room: Room;
    isHost: boolean;
}
export declare class RoomWithParticipantsDto extends RoomResponseDto {
    participants: Array<{
        id: string;
        userId: string;
        displayName: string;
        role: string;
        isActive: boolean;
        joinedAt: Date | null;
    }>;
}
