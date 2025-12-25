import { Module } from '@nestjs/common';
import { RoomConfigService } from './room-config.service';
import { RoomConfigController } from './room-config.controller';
import { DatabaseModule } from '../database/database.module';
import { RoomModule } from '../room/room.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [DatabaseModule, RoomModule, GatewayModule],
  providers: [RoomConfigService],
  controllers: [RoomConfigController],
  exports: [RoomConfigService],
})
export class RoomConfigModule {}
