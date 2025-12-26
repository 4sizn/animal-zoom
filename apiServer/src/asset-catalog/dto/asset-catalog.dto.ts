import {
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Asset type enum
 */
export enum AssetType {
  AVATAR = 'avatar',
  TEXTURE = 'texture',
  ACCESSORY = 'accessory',
  ENVIRONMENT = 'environment',
}

/**
 * Asset status enum
 */
export enum AssetStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * DTO for creating a new asset
 */
export class CreateAssetDto {
  @ApiProperty({ enum: AssetType, description: 'Type of the asset' })
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({ description: 'Name of the asset', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'S3/MinIO key (path) of the asset' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Category of the asset' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for the asset',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Semantic version (e.g., 1.0.0)',
    pattern: '^\\d+\\.\\d+\\.\\d+$',
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'Version must follow semantic versioning (e.g., 1.0.0)',
  })
  version: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(0)
  fileSize: number;

  @ApiProperty({ description: 'MIME type of the asset' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Thumbnail key (S3/MinIO path)' })
  @IsString()
  @IsOptional()
  thumbnailKey?: string | null;

  @ApiPropertyOptional({
    description: 'Additional metadata (JSON)',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'User ID who uploaded the asset' })
  @IsString()
  uploadedBy: string;
}

/**
 * DTO for updating an asset
 */
export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'Name of the asset' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Category of the asset' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for the asset',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Thumbnail key' })
  @IsString()
  @IsOptional()
  thumbnailKey?: string | null;

  @ApiPropertyOptional({
    description: 'Additional metadata (JSON)',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ enum: AssetStatus, description: 'Asset status' })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;
}

/**
 * DTO for filtering/listing assets
 */
export class AssetFilterDto {
  @ApiPropertyOptional({ enum: AssetType, description: 'Filter by asset type' })
  @IsEnum(AssetType)
  @IsOptional()
  assetType?: AssetType;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by tags (AND logic)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ enum: AssetStatus, description: 'Filter by status' })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({ description: 'Pagination limit', default: 20 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Pagination offset', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ description: 'Filter by uploader user ID' })
  @IsString()
  @IsOptional()
  uploadedBy?: string;
}

/**
 * Response DTO for asset
 */
export class AssetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AssetType })
  assetType: AssetType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  version: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiPropertyOptional()
  thumbnailKey?: string | null;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty({ enum: AssetStatus })
  status: AssetStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
