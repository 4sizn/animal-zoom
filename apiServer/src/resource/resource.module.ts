import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service.js';
import { ResourceController } from './resource.controller.js';
import { S3Service } from './s3.service.js';
import { AssetUploadService } from './asset-upload.service.js';
import { GlbValidator } from './validators/glb-validator.js';
import { GlbMetadataExtractor } from './extractors/glb-metadata-extractor.js';
import { DatabaseModule } from '../database/database.module.js';
import { AssetCatalogModule } from '../asset-catalog/asset-catalog.module.js';

@Module({
  imports: [DatabaseModule, AssetCatalogModule],
  providers: [
    ResourceService,
    S3Service,
    AssetUploadService,
    GlbValidator,
    GlbMetadataExtractor,
  ],
  controllers: [ResourceController],
  exports: [ResourceService, S3Service, AssetUploadService],
})
export class ResourceModule {}
