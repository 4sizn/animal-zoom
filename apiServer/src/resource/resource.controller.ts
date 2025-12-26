import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceService, ModelResource } from './resource.service.js';
import { AssetUploadService } from './asset-upload.service.js';
import { S3Service } from './s3.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AssetType } from '../asset-catalog/dto/asset-catalog.dto.js';

@ApiTags('Resources')
@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(
    private resourceService: ResourceService,
    private assetUploadService: AssetUploadService,
    private s3Service: S3Service,
  ) {}

  @Get('models')
  async getModels(): Promise<ModelResource[]> {
    return this.resourceService.getAvailableModels();
  }

  @Get('models/:id')
  async getModelUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.resourceService.getModelUrl(id);
    return { url };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadModel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /\.(glb)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<ModelResource> {
    return this.resourceService.uploadModel(file);
  }

  @Delete('models/:id')
  async deleteModel(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.resourceService.deleteModel(id);
    return { success: true };
  }

  /**
   * Upload asset with full pipeline (validation, metadata extraction, catalog)
   * POST /resources/assets/upload
   */
  @Post('assets/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload asset with metadata and catalog integration',
  })
  @ApiResponse({ status: 201, description: 'Asset uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or metadata' })
  async uploadAsset(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /\.(glb)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body()
    metadata: {
      assetType: AssetType;
      category: string;
      version: string;
      name: string;
      tags?: string[];
      uploadedBy: string;
    },
  ) {
    const tags = metadata.tags || [];

    return this.assetUploadService.uploadAsset(file, {
      assetType: metadata.assetType,
      category: metadata.category,
      version: metadata.version,
      name: metadata.name,
      tags: Array.isArray(tags) ? tags : [],
      uploadedBy: metadata.uploadedBy,
    });
  }

  /**
   * Get presigned URL for asset by S3 key
   * GET /resources/assets/:key/url
   */
  @Get('assets/:key/url')
  @ApiOperation({ summary: 'Get presigned URL for asset' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  async getAssetUrl(@Param('key') key: string): Promise<{ url: string }> {
    const url = await this.s3Service.generateSignedUrl(key, 3600);
    return { url };
  }
}
