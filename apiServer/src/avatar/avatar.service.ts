import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { AssetCatalogService } from '../asset-catalog/asset-catalog.service.js';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto.js';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(
    private db: DatabaseService,
    private assetCatalogService: AssetCatalogService,
  ) {}

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
      modelAssetId: null,
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

  /**
   * Resolve modelAssetId to modelUrl for client consumption
   * Provides backward compatibility:
   * 1. If modelAssetId exists, resolve it to URL from asset catalog
   * 2. Otherwise, use modelUrl directly
   * 3. Fall back to null if neither exists
   */
  async resolveModelUrl(config: AvatarConfig): Promise<string | null> {
    // Priority 1: Use modelAssetId if available
    if (config.modelAssetId) {
      try {
        const asset = await this.assetCatalogService.findAssetById(
          config.modelAssetId,
        );
        if (asset && asset.key) {
          this.logger.log(
            `Resolved asset ID ${config.modelAssetId} to key: ${asset.key}`,
          );
          return asset.key; // Return S3 key, client will get presigned URL
        }
      } catch (error) {
        this.logger.warn(
          `Failed to resolve asset ID ${config.modelAssetId}: ${error}`,
        );
        // Fall through to use modelUrl
      }
    }

    // Priority 2: Use modelUrl if available (backward compatibility)
    if (config.modelUrl) {
      return config.modelUrl;
    }

    // Priority 3: No model configured
    return null;
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
