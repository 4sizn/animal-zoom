import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetFilterDto,
  AssetResponseDto,
  AssetStatus,
  AssetType,
} from './dto/asset-catalog.dto.js';
import { sql } from 'kysely';

/**
 * Service for managing asset catalog
 */
@Injectable()
export class AssetCatalogService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create a new asset metadata entry
   */
  async createAsset(dto: CreateAssetDto): Promise<AssetResponseDto> {
    const db = this.databaseService.db;

    this.validateMetadata(dto);
    await this.checkVersionConflict(dto.key, dto.version);

    const result = await db
      .insertInto('asset_catalog')
      .values({
        assetType: dto.assetType,
        name: dto.name,
        key: dto.key,
        category: dto.category,
        tags: dto.tags || [],
        version: dto.version,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        thumbnailKey: dto.thumbnailKey || null,
        metadata: dto.metadata || null,
        uploadedBy: dto.uploadedBy,
        status: AssetStatus.ACTIVE,
        updatedAt: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();

    return result as AssetResponseDto;
  }

  /**
   * List assets with optional filters
   */
  async listAssets(filter: AssetFilterDto): Promise<AssetResponseDto[]> {
    const db = this.databaseService.db;

    let query = db.selectFrom('asset_catalog').selectAll();

    if (filter.assetType) {
      query = query.where('assetType', '=', filter.assetType);
    }

    if (filter.category) {
      query = query.where('category', '=', filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      for (const tag of filter.tags) {
        query = query.where(
          sql`tags`,
          '@>',
          sql`${JSON.stringify([tag])}::jsonb`,
        );
      }
    }

    if (filter.status) {
      query = query.where('status', '=', filter.status);
    }

    if (filter.uploadedBy) {
      query = query.where('uploadedBy', '=', filter.uploadedBy);
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.offset(filter.offset);
    }

    const results = await query.execute();
    return results as AssetResponseDto[];
  }

  /**
   * Find asset by ID
   */
  async findAssetById(id: string): Promise<AssetResponseDto | null> {
    const db = this.databaseService.db;

    const result = await db
      .selectFrom('asset_catalog')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? (result as AssetResponseDto) : null;
  }

  /**
   * Update asset metadata
   */
  async updateAsset(
    id: string,
    dto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    const db = this.databaseService.db;

    this.validateMetadata(dto);

    const updateData: {
      name?: string;
      category?: string;
      tags?: string[];
      thumbnailKey?: string | null;
      metadata?: Record<string, unknown> | null;
      status?: AssetStatus;
    } = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.thumbnailKey !== undefined)
      updateData.thumbnailKey = dto.thumbnailKey;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    if (dto.status !== undefined) updateData.status = dto.status;

    const result = await db
      .updateTable('asset_catalog')
      .set(updateData)
      .set({ updatedAt: sql`now()` })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return result as AssetResponseDto;
  }

  /**
   * Mark asset as deprecated
   */
  async deprecateAsset(id: string): Promise<AssetResponseDto> {
    return this.updateAsset(id, { status: AssetStatus.DEPRECATED });
  }

  /**
   * Check for version conflicts
   */
  async checkVersionConflict(key: string, version: string): Promise<void> {
    const db = this.databaseService.db;

    const existing = await db
      .selectFrom('asset_catalog')
      .select('id')
      .where('key', '=', key)
      .where('version', '=', version)
      .executeTakeFirst();

    if (existing) {
      throw new Error(
        `Version conflict: Asset with key "${key}" and version "${version}" already exists`,
      );
    }
  }

  /**
   * Validate asset metadata
   */
  validateMetadata(dto: CreateAssetDto | UpdateAssetDto): void {
    // Validate asset type (if present in CreateAssetDto)
    if ('assetType' in dto) {
      const validTypes = Object.values(AssetType);
      if (!validTypes.includes(dto.assetType)) {
        throw new Error(`Invalid asset type: ${dto.assetType}`);
      }
    }

    // Validate name
    if ('name' in dto) {
      if (!dto.name || dto.name.trim().length === 0) {
        throw new Error('Name is required and cannot be empty');
      }
    }

    // Validate version format (if present in CreateAssetDto)
    if ('version' in dto) {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(dto.version)) {
        throw new Error(
          `Invalid version format: ${dto.version}. Must follow semantic versioning (e.g., 1.0.0)`,
        );
      }
    }
  }
}
