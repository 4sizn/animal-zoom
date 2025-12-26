import { Module } from '@nestjs/common';
import { AssetCatalogController } from './asset-catalog.controller.js';
import { AssetCatalogService } from './asset-catalog.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AssetCatalogController],
  providers: [AssetCatalogService],
  exports: [AssetCatalogService],
})
export class AssetCatalogModule {}
