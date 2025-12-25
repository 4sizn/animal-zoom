import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { S3Service } from './s3.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ResourceService, S3Service],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule {}
