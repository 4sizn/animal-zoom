export declare class JoinRoomEventDto {
    roomCode: string;
}
export declare class LeaveRoomEventDto {
    roomCode: string;
}
export declare class ChatMessageDto {
    roomCode: string;
    message: string;
}
export declare class SyncStateDto {
    roomCode: string;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    avatarState?: any;
}
