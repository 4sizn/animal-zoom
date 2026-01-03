import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AssetCatalogService } from './asset-catalog.service.js';
import { S3Service } from '../resource/s3.service.js';
import { AssetResponseDto, CreateAssetDto } from './dto/asset-catalog.dto.js';

/**
 * Service for managing asset versioning
 * Handles semantic versioning, version comparison, and version migrations
 */
@Injectable()
export class AssetVersioningService {
  private readonly logger = new Logger(AssetVersioningService.name);

  constructor(
    private readonly assetCatalogService: AssetCatalogService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Create a new version of an existing asset
   * Copies the asset in S3 and creates a new catalog entry
   */
  async createNewVersion(
    assetId: string,
    newVersion: string,
  ): Promise<AssetResponseDto> {
    // Validate version format
    this.validateVersionFormat(newVersion);

    // Get existing asset
    const existingAsset =
      await this.assetCatalogService.findAssetById(assetId);
    if (!existingAsset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Validate that new version is greater than old
    if (this.compareVersions(newVersion, existingAsset.version) <= 0) {
      throw new BadRequestException(
        `New version ${newVersion} must be greater than current version ${existingAsset.version}`,
      );
    }

    // Generate new key with new version
    const newKey = this.updateVersionInKey(existingAsset.key, newVersion);

    // Copy asset in S3
    try {
      await this.s3Service.copyAsset(existingAsset.key, newKey);
      this.logger.log(
        `Copied asset from ${existingAsset.key} to ${newKey} for version ${newVersion}`,
      );
    } catch (error) {
      this.logger.error(`Failed to copy asset in S3: ${error.message}`);
      throw new BadRequestException(
        `Failed to copy asset in S3: ${error.message}`,
      );
    }

    // Copy thumbnail if exists
    if (existingAsset.thumbnailKey) {
      const newThumbnailKey = this.updateVersionInKey(
        existingAsset.thumbnailKey,
        newVersion,
      );
      try {
        await this.s3Service.copyAsset(
          existingAsset.thumbnailKey,
          newThumbnailKey,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to copy thumbnail: ${error.message}. Proceeding without thumbnail.`,
        );
      }
    }

    // Create new catalog entry
    const createDto: CreateAssetDto = {
      assetType: existingAsset.assetType,
      name: existingAsset.name,
      key: newKey,
      category: existingAsset.category,
      tags: existingAsset.tags,
      version: newVersion,
      fileSize: existingAsset.fileSize,
      mimeType: existingAsset.mimeType,
      thumbnailKey: existingAsset.thumbnailKey
        ? this.updateVersionInKey(existingAsset.thumbnailKey, newVersion)
        : undefined,
      metadata: existingAsset.metadata || undefined,
      uploadedBy: existingAsset.uploadedBy,
    };

    const newAsset = await this.assetCatalogService.createAsset(createDto);

    this.logger.log(
      `Created new version ${newVersion} for asset ${existingAsset.name} (ID: ${newAsset.id})`,
    );

    return newAsset;
  }

  /**
   * List all versions of an asset by its base key
   * Returns versions sorted by version number (latest first)
   */
  async listVersions(assetKeyPrefix: string): Promise<AssetResponseDto[]> {
    // List all assets
    const assets = await this.assetCatalogService.listAssets({});

    // Filter assets that match the key prefix
    // We look for keys that start with the prefix (ignoring version part)
    const matchingAssets = assets.filter((asset) => {
      if (!asset.key) return false;

      // Extract base key from both the asset key and search prefix
      const assetBaseKey = this.extractBaseKey(asset.key);
      const searchBaseKey = assetKeyPrefix.includes('/')
        ? assetKeyPrefix
        : assetKeyPrefix;

      // Match if the asset key starts with the search prefix
      return asset.key.startsWith(searchBaseKey) || assetBaseKey.startsWith(searchBaseKey);
    });

    // Sort by version (latest first)
    return matchingAssets.sort((a, b) =>
      this.compareVersions(b.version, a.version),
    );
  }

  /**
   * Mark an old version as deprecated
   */
  async deprecateOldVersion(assetId: string): Promise<AssetResponseDto> {
    return this.assetCatalogService.deprecateAsset(assetId);
  }

  /**
   * Compare two semantic versions
   * Returns: positive if v1 > v2, negative if v1 < v2, zero if equal
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }

    return 0;
  }

  /**
   * Get the latest version for an asset
   */
  async getLatestVersion(assetKeyPrefix: string): Promise<AssetResponseDto> {
    const versions = await this.listVersions(assetKeyPrefix);

    if (versions.length === 0) {
      throw new NotFoundException(
        `No versions found for asset key prefix: ${assetKeyPrefix}`,
      );
    }

    return versions[0]; // First element is latest (sorted in listVersions)
  }

  /**
   * Validate semantic version format (major.minor.patch)
   */
  private validateVersionFormat(version: string): void {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(version)) {
      throw new BadRequestException(
        `Invalid version format: ${version}. Must follow semantic versioning (e.g., 1.0.0)`,
      );
    }
  }

  /**
   * Update version number in an S3 key
   * Example: avatars/fox/1.0.0/model.glb -> avatars/fox/1.1.0/model.glb
   */
  private updateVersionInKey(key: string, newVersion: string): string {
    const parts = key.split('/');
    // Find the version part (assumes format: .../{version}/...)
    const versionIndex = parts.findIndex((part) => /^\d+\.\d+\.\d+$/.test(part));

    if (versionIndex !== -1) {
      parts[versionIndex] = newVersion;
      return parts.join('/');
    }

    // If no version found in path, insert it before filename
    const filename = parts[parts.length - 1];
    parts[parts.length - 1] = newVersion;
    parts.push(filename);
    return parts.join('/');
  }

  /**
   * Extract base key without version
   * Example: avatars/fox/1.0.0/model.glb -> avatars/fox
   */
  private extractBaseKey(key: string): string {
    const parts = key.split('/');
    // Remove version and filename
    return parts
      .filter((part) => !/^\d+\.\d+\.\d+$/.test(part)) // Remove version
      .slice(0, -1) // Remove filename
      .join('/');
  }
}
