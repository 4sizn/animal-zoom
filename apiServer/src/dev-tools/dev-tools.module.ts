import { Module } from '@nestjs/common';
import { DemoRoomService } from './demo-room.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [DemoRoomService],
  exports: [DemoRoomService],
})
export class DevToolsModule {}
