import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { DatabaseModule } from '../database/database.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [DatabaseModule, GatewayModule],
  providers: [AvatarService],
  controllers: [AvatarController],
  exports: [AvatarService],
})
export class AvatarModule {}
