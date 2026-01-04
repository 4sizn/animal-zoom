import { Module } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { GracePeriodManager } from './grace-period-manager.js';
import { DevToolsModule } from '../dev-tools/dev-tools.module.js';

@Module({
  imports: [DatabaseModule, DevToolsModule],
  providers: [RoomService, GracePeriodManager],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
