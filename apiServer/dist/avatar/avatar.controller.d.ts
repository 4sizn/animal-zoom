import { AvatarService } from './avatar.service.js';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto.js';
import { User } from '../database/schema/users.js';
import { RoomGateway } from '../gateway/room.gateway.js';
export declare class AvatarController {
    private avatarService;
    private roomGateway;
    constructor(avatarService: AvatarService, roomGateway: RoomGateway);
    getMyAvatar(user: Omit<User, 'password'>): Promise<AvatarConfig>;
    updateMyAvatar(user: Omit<User, 'password'>, updateDto: UpdateAvatarDto): Promise<AvatarConfig>;
    getAvatar(userId: string): Promise<AvatarConfig>;
}
