import { Module } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { GracePeriodManager } from './grace-period-manager.js';

@Module({
  imports: [DatabaseModule],
  providers: [RoomService, GracePeriodManager],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
