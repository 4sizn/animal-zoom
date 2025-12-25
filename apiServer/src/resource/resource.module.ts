import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service.js';
import { ResourceController } from './resource.controller.js';
import { S3Service } from './s3.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [ResourceService, S3Service],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule {}
