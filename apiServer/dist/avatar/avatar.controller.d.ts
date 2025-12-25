import { AvatarService } from './avatar.service';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto';
import { User } from '../database/schema/users';
import { RoomGateway } from '../gateway/room.gateway';
export declare class AvatarController {
    private avatarService;
    private roomGateway;
    constructor(avatarService: AvatarService, roomGateway: RoomGateway);
    getMyAvatar(user: Omit<User, 'password'>): Promise<AvatarConfig>;
    updateMyAvatar(user: Omit<User, 'password'>, updateDto: UpdateAvatarDto): Promise<AvatarConfig>;
    getAvatar(userId: string): Promise<AvatarConfig>;
}
