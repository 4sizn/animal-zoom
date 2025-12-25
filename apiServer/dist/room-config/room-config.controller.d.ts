import { RoomConfigService } from './room-config.service.js';
import { UpdateRoomConfigDto, RoomConfig } from './dto/update-room-config.dto.js';
import { User } from '../database/schema/users.js';
import { RoomGateway } from '../gateway/room.gateway.js';
export declare class RoomConfigController {
    private roomConfigService;
    private roomGateway;
    constructor(roomConfigService: RoomConfigService, roomGateway: RoomGateway);
    getRoomConfig(roomCode: string): Promise<RoomConfig>;
    updateRoomConfig(user: Omit<User, 'password'>, roomCode: string, updateDto: UpdateRoomConfigDto): Promise<RoomConfig>;
}
