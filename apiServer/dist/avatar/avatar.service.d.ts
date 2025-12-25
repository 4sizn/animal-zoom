import { DatabaseService } from '../database/database.service';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto';
export declare class AvatarService {
    private db;
    constructor(db: DatabaseService);
    getMyAvatar(userId: string): Promise<AvatarConfig>;
    updateMyAvatar(userId: string, updateDto: UpdateAvatarDto): Promise<AvatarConfig>;
    getAvatarByUserId(userId: string): Promise<AvatarConfig>;
}
