import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto';

@Injectable()
export class AvatarService {
  constructor(private db: DatabaseService) {}

  async getMyAvatar(userId: string): Promise<AvatarConfig> {
    const user = await this.db.db
      .selectFrom('users')
      .select(['avatarCustomization'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return default config if not set
    const defaultConfig: AvatarConfig = {
      modelUrl: null,
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      accessories: [],
    };

    if (!user.avatarCustomization) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...(user.avatarCustomization as Partial<AvatarConfig>),
    };
  }

  async updateMyAvatar(
    userId: string,
    updateDto: UpdateAvatarDto,
  ): Promise<AvatarConfig> {
    // Get current config
    const currentConfig = await this.getMyAvatar(userId);

    // Merge with updates
    const newConfig: AvatarConfig = {
      ...currentConfig,
      ...updateDto,
    };

    // Update in database
    await this.db.db
      .updateTable('users')
      .set({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        avatarCustomization: newConfig as any,
        updatedAt: new Date(),
      })
      .where('id', '=', userId)
      .execute();

    return newConfig;
  }

  async getAvatarByUserId(userId: string): Promise<AvatarConfig> {
    return this.getMyAvatar(userId);
  }
}
