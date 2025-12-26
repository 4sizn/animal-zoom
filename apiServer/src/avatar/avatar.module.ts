import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service.js';
import { AvatarController } from './avatar.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { GatewayModule } from '../gateway/gateway.module.js';
import { AssetCatalogModule } from '../asset-catalog/asset-catalog.module.js';

@Module({
  imports: [DatabaseModule, GatewayModule, AssetCatalogModule],
  providers: [AvatarService],
  controllers: [AvatarController],
  exports: [AvatarService],
})
export class AvatarModule {}
