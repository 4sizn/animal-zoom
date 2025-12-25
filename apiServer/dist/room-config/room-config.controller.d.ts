import { RoomConfigService } from './room-config.service';
import { UpdateRoomConfigDto, RoomConfig } from './dto/update-room-config.dto';
import { User } from '../database/schema/users';
import { RoomGateway } from '../gateway/room.gateway';
export declare class RoomConfigController {
    private roomConfigService;
    private roomGateway;
    constructor(roomConfigService: RoomConfigService, roomGateway: RoomGateway);
    getRoomConfig(roomCode: string): Promise<RoomConfig>;
    updateRoomConfig(user: Omit<User, 'password'>, roomCode: string, updateDto: UpdateRoomConfigDto): Promise<RoomConfig>;
}
