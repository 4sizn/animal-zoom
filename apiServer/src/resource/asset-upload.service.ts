import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { AssetCatalogService } from '../asset-catalog/asset-catalog.service.js';
import { GlbValidator } from './validators/glb-validator.js';
import { GlbMetadataExtractor } from './extractors/glb-metadata-extractor.js';
import {
  AssetType,
  AssetResponseDto,
} from '../asset-catalog/dto/asset-catalog.dto.js';
import { v4 as uuidv4 } from 'uuid';
import {
  generateAssetPath,
  getFileExtension,
} from './utils/asset-path.util.js';
import { AssetUploadException } from './exceptions/asset-exceptions.js';

export interface AssetUploadOptions {
  assetType: AssetType;
  category: string;
  version: string;
  name: string;
  tags: string[];
  uploadedBy: string;
}

/**
 * Service for uploading assets with validation, metadata extraction,
 * and catalog integration
 */
@Injectable()
export class AssetUploadService {
  private readonly logger = new Logger(AssetUploadService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly assetCatalogService: AssetCatalogService,
    private readonly glbValidator: GlbValidator,
    private readonly metadataExtractor: GlbMetadataExtractor,
  ) {}

  /**
   * Upload an asset with full pipeline:
   * 1. Validate GLB structure
   * 2. Extract metadata
   * 3. Upload to S3
   * 4. Create catalog entry
   * 5. Rollback on failure
   */
  async uploadAsset(
    file: Express.Multer.File,
    options: AssetUploadOptions,
  ): Promise<AssetResponseDto> {
    let s3Key: string | null = null;

    try {
      // Step 1: Validate GLB structure
      this.logger.log(`Validating GLB file: ${file.originalname}`);
      this.glbValidator.validate(file.buffer);

      // Step 2: Extract metadata
      this.logger.log(`Extracting metadata from: ${file.originalname}`);
      const glbMetadata = this.metadataExtractor.extract(file.buffer);

      // Step 3: Generate structured path and upload to S3
      const assetId = uuidv4();
      const fileExtension = getFileExtension(file.originalname);
      s3Key = generateAssetPath(
        options.assetType,
        options.category,
        options.version,
        assetId,
        fileExtension,
      );

      this.logger.log(`Uploading to S3: ${s3Key}`);
      const s3Result = await this.s3Service.uploadFile(file, s3Key);

      // Step 4: Create catalog entry
      this.logger.log(`Creating catalog entry for: ${options.name}`);
      try {
        const catalogEntry = await this.assetCatalogService.createAsset({
          assetType: options.assetType,
          name: options.name,
          key: s3Result.key,
          category: options.category,
          tags: options.tags,
          version: options.version,
          fileSize: file.size,
          mimeType: file.mimetype,
          metadata: glbMetadata,
          uploadedBy: options.uploadedBy,
        });

        this.logger.log(`Asset uploaded successfully: ${catalogEntry.id}`);
        return catalogEntry;
      } catch (catalogError) {
        // Rollback: Delete S3 file if catalog creation fails
        this.logger.error(
          `Catalog creation failed, rolling back S3 upload: ${s3Key}`,
        );
        await this.s3Service.deleteFile(s3Key);
        throw catalogError;
      }
    } catch (error) {
      // If S3 upload failed or validation failed, no rollback needed
      // S3 key is only set after successful upload
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Asset upload failed: ${errorMessage}`);
      throw new AssetUploadException(
        `Failed to upload asset: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
