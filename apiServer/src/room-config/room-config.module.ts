import { Module } from '@nestjs/common';
import { RoomConfigService } from './room-config.service.js';
import { RoomConfigController } from './room-config.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { RoomModule } from '../room/room.module.js';
import { GatewayModule } from '../gateway/gateway.module.js';

@Module({
  imports: [DatabaseModule, RoomModule, GatewayModule],
  providers: [RoomConfigService],
  controllers: [RoomConfigController],
  exports: [RoomConfigService],
})
export class RoomConfigModule {}
