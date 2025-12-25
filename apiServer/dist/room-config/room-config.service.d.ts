import { DatabaseService } from '../database/database.service.js';
import { UpdateRoomConfigDto, RoomConfig } from './dto/update-room-config.dto.js';
export declare class RoomConfigService {
    private db;
    constructor(db: DatabaseService);
    getRoomConfig(roomCode: string): Promise<RoomConfig>;
    updateRoomConfig(roomCode: string, userId: string, updateDto: UpdateRoomConfigDto): Promise<RoomConfig>;
}
